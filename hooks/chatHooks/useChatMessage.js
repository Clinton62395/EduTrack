import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// firestore operations via db; FieldValue used for special values

export function useChat(trainingId, user) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});

  const lastVisibleRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // 📂 RÉFÉRENCE DE LA SOUS-COLLECTION CHAT
  // On la définit ici pour plus de clarté
  const chatColRef = useMemo(
    () =>
      trainingId
        ? db.collection("formations").doc(trainingId).collection("chat")
        : null,
    [trainingId],
  );

  // 1. Écouter les participants (inchangé mais utile)
  const [learnerCount, setLearnerCount] = useState(0);
  useEffect(() => {
    if (!trainingId) return;
    return db
      .collection("formations")
      .doc(trainingId)
      .onSnapshot((snap) => {
        const participants = snap.data()?.participants || [];
        setLearnerCount(participants.length);
      });
  }, [trainingId]);

  // 2. MESSAGES EN TEMPS RÉEL (Modifié pour pointer vers la sous-collection)
  useEffect(() => {
    if (!chatColRef) {
      setLoading(false);
      return;
    }

    setLoading(true);
    if (unsubscribeRef.current) unsubscribeRef.current();

    const q = chatColRef.orderBy("createdAt", "desc").limit(50);

    unsubscribeRef.current = q.onSnapshot(
      (snapshot) => {
        if (snapshot.docs.length > 0) {
          lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
          setHasMoreMessages(snapshot.docs.length === 50);
        } else {
          setHasMoreMessages(false);
        }

        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || null,
          }))
          .reverse();

        setMessages(data);
        setLoading(false);
      },
      (err) => {
        console.error("Erreur Chat:", err);
        setError("Erreur de connexion");
        setLoading(false);
      },
    );

    return () => unsubscribeRef.current?.();
  }, [chatColRef]);

  // 3. INDICATEUR DE FRAPPE (Modifié : On peut aussi le mettre en sous-collection)
  // Pour rester simple, on garde typing_indicators en racine, mais on filtre par trainingId
  useEffect(() => {
    if (!trainingId || !user?.uid) return;
    const q = db
      .collection("typing_indicators")
      .where("trainingId", "==", trainingId)
      .where("isTyping", "==", true);

    return q.onSnapshot((snapshot) => {
      const typing = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.userId !== user.uid) typing[data.userId] = data.userName;
      });
      setTypingUsers(typing);
    });
  }, [trainingId, user?.uid]);

  // 4. CHARGER PLUS (Modifié pour la sous-collection)
  const loadMoreMessages = useCallback(async () => {
    if (
      !chatColRef ||
      !lastVisibleRef.current ||
      loadingMore ||
      !hasMoreMessages
    )
      return;
    setLoadingMore(true);
    try {
      const q = chatColRef
        .orderBy("createdAt", "desc")
        .startAfter(lastVisibleRef.current)
        .limit(20);
      const snapshot = await q.get();
      if (snapshot.docs.length > 0) {
        lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
        setHasMoreMessages(snapshot.docs.length === 20);
        const older = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .reverse();
        setMessages((prev) => [...older, ...prev]);
      } else {
        setHasMoreMessages(false);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [chatColRef, loadingMore, hasMoreMessages]);

  // 5. ENVOI DE MESSAGE (Modifié : addDoc dans la sous-collection)
  const sendMessage = useCallback(
    async (text, replyId = null, attachment = null) => {
      if (!chatColRef || !user?.uid) return;
      const trimmed = (text ?? inputText).trim();
      if (!trimmed && !attachment) return;
      if (sending) return;

      try {
        setSending(true);
        setInputText("");

        // On n'a plus besoin de stocker "trainingId" à l'intérieur du doc
        // car le chemin du doc (/formations/ID/chat/...) le contient déjà !
        // Mais on peut le laisser pour des exports de données futurs.
        await chatColRef.add({
          senderId: user.uid,
          senderName: user.name || "Utilisateur",
          senderRole: user.role || "learner",
          senderAvatar: user.avatar || null,
          text: trimmed,
          createdAt: firestore.FieldValue.serverTimestamp(),
          pinned: false,
          readBy: [user.uid],
          reactions: [],
          replyToId: replyId || null,
          attachment: attachment || null,
        });
      } catch (err) {
        setError("Échec de l'envoi");
      } finally {
        setSending(false);
      }
    },
    [chatColRef, user, inputText, sending],
  );

  // 6. TOGGLE REACTION (Modifié : docRef dans la sous-collection)
  const toggleReaction = useCallback(
    async (messageId, emoji) => {
      if (!trainingId || !user?.uid || !messageId) return;
      const message = messages.find((m) => m.id === messageId);
      const existingReaction = message?.reactions?.find(
        (r) => r.userId === user.uid && r.emoji === emoji,
      );

      try {
        // LE CHEMIN DU DOC CHANGE ICI
        const docRef = db
          .collection("formations")
          .doc(trainingId)
          .collection("chat")
          .doc(messageId);
        await docRef.update({
          reactions: existingReaction
            ? firestore.FieldValue.arrayRemove(existingReaction)
            : firestore.FieldValue.arrayUnion({
                userId: user.uid,
                userName: user.name || "Utilisateur",
                emoji,
                timestamp: new Date().toISOString(),
              }),
        });
      } catch (err) {
        console.error(err);
      }
    },
    [trainingId, user, messages],
  );

  // Dans useChat.js
  const markAsRead = useCallback(
    async (messageId) => {
      if (!trainingId || !user?.uid) return;
      try {
        const docRef = db
          .collection("formations")
          .doc(trainingId)
          .collection("chat")
          .doc(messageId);
        await docRef.update({
          readBy: firestore.FieldValue.arrayUnion(user.uid),
        });
      } catch (err) {
        console.error("Erreur markAsRead:", err);
      }
    },
    [trainingId, user?.uid],
  );

  // 7. TOGGLE PIN
  const togglePin = useCallback(
    async (messageId, pinned) => {
      if (!trainingId || !messageId) return;
      try {
        const docRef = db
          .collection("formations")
          .doc(trainingId)
          .collection("chat")
          .doc(messageId);
        await docRef.update({ pinned });
      } catch (err) {
        console.error("Erreur togglePin:", err);
      }
    },
    [trainingId],
  );

  // 📊 DONNÉES DÉRIVÉES
  const pinnedMessages = useMemo(
    () => messages.filter((m) => m.pinned),
    [messages],
  );
  const unreadCount = useMemo(
    () =>
      messages.filter(
        (m) => !m.readBy?.includes(user?.uid) && m.senderId !== user?.uid,
      ).length,
    [messages, user?.uid],
  );

  return {
    messages,
    pinnedMessages,
    unreadCount,
    inputText,
    setInputText,
    loading,
    learnerCount,
    loadingMore,
    sending,
    error,
    hasMoreMessages,
    loadMoreMessages,
    typingUsers,
    markAsRead,
    sendMessage,
    togglePin,
    toggleReaction,
  };
}
