import { db } from "@/components/lib/firebase"; // Instance firestore() native
import firestore from "@react-native-firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useChat(trainingId, user) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [learnerCount, setLearnerCount] = useState(0);

  const lastVisibleRef = useRef(null);
  const unsubscribeChatRef = useRef(null);

  // 📂 RÉFÉRENCE NATIVE DE LA SOUS-COLLECTION
  const chatColRef = useMemo(
    () =>
      trainingId
        ? db.collection("formations").doc(trainingId).collection("chat")
        : null,
    [trainingId],
  );

  // 1. ÉCOUTE DU NOMBRE DE PARTICIPANTS
  useEffect(() => {
    if (!trainingId) return;
    return db
      .collection("formations")
      .doc(trainingId)
      .onSnapshot((snap) => {
        setLearnerCount(snap.data()?.participants?.length || 0);
      });
  }, [trainingId]);

  // 2. MESSAGES EN TEMPS RÉEL (Native onSnapshot)
  useEffect(() => {
    if (!chatColRef) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // On nettoie l'ancien écouteur s'il existe
    if (unsubscribeChatRef.current) unsubscribeChatRef.current();

    const q = chatColRef.orderBy("createdAt", "desc").limit(50);

    unsubscribeChatRef.current = q.onSnapshot(
      (snapshot) => {
        if (!snapshot) return;

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
            // Conversion native du Timestamp en Date JS
            createdAt: doc.data().createdAt?.toDate() || null,
          }))
          .reverse();

        setMessages(data);
        setLoading(false);
      },
      (err) => {
        console.error("Erreur Chat Native:", err);
        setError("Erreur de connexion au chat");
        setLoading(false);
      },
    );

    return () => unsubscribeChatRef.current?.();
  }, [chatColRef]);

  // 3. INDICATEUR DE FRAPPE (Optimisé)
  useEffect(() => {
    if (!trainingId || !user?.uid) return;

    return db
      .collection("typing_indicators")
      .where("trainingId", "==", trainingId)
      .where("isTyping", "==", true)
      .onSnapshot((snapshot) => {
        const typing = {};
        snapshot?.docs.forEach((d) => {
          const data = d.data();
          if (data.userId !== user.uid) {
            typing[data.userId] = data.userName;
          }
        });
        setTypingUsers(typing);
      });
  }, [trainingId, user?.uid]);

  // 4. CHARGER PLUS (Pagination Native)
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
      const snapshot = await chatColRef
        .orderBy("createdAt", "desc")
        .startAfter(lastVisibleRef.current)
        .limit(20)
        .get();

      if (snapshot.docs.length > 0) {
        lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
        setHasMoreMessages(snapshot.docs.length === 20);

        const older = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate() || null,
          }))
          .reverse();

        setMessages((prev) => [...older, ...prev]);
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error("LoadMore Error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [chatColRef, loadingMore, hasMoreMessages]);

  // 5. ENVOI DE MESSAGE
  const sendMessage = useCallback(
    async (text, replyId = null, attachment = null) => {
      if (!chatColRef || !user?.uid) return;
      const trimmed = (text ?? inputText).trim();
      if (!trimmed && !attachment) return;
      if (sending) return;

      try {
        setSending(true);
        setInputText("");

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
          // On garde trainingId pour faciliter d'éventuelles fonctions Cloud ou analytics
          trainingId,
        });
      } catch (err) {
        console.error("Send Message Error:", err);
        setError("Échec de l'envoi");
      } finally {
        setSending(false);
      }
    },
    [chatColRef, user, inputText, sending, trainingId],
  );

  // 6. REACTIONS & LECTURE (Atomic FieldValue)
  const toggleReaction = useCallback(
    async (messageId, emoji) => {
      if (!trainingId || !user?.uid || !messageId) return;
      const message = messages.find((m) => m.id === messageId);
      const existing = message?.reactions?.find(
        (r) => r.userId === user.uid && r.emoji === emoji,
      );

      try {
        const docRef = chatColRef.doc(messageId);
        await docRef.update({
          reactions: existing
            ? firestore.FieldValue.arrayRemove(existing)
            : firestore.FieldValue.arrayUnion({
                userId: user.uid,
                userName: user.name || "Utilisateur",
                emoji,
                timestamp: new Date().toISOString(),
              }),
        });
      } catch (err) {
        console.error("Reaction Error:", err);
      }
    },
    [chatColRef, user, messages, trainingId],
  );

  const markAsRead = useCallback(
    async (messageId) => {
      if (!chatColRef || !user?.uid) return;
      try {
        await chatColRef.doc(messageId).update({
          readBy: firestore.FieldValue.arrayUnion(user.uid),
        });
      } catch (err) {
        console.error("Read Error:", err);
      }
    },
    [chatColRef, user?.uid],
  );

  const togglePin = useCallback(
    async (messageId, pinned) => {
      if (!chatColRef || !messageId) return;
      try {
        await chatColRef.doc(messageId).update({ pinned });
      } catch (err) {
        console.error("Pin Error:", err);
      }
    },
    [chatColRef],
  );

  // 📊 CALCULS DÉRIVÉS (Mémoïsés pour la performance)
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
