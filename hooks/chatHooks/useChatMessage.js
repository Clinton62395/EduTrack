import { db } from "@/components/lib/firebase";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
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

  const lastVisibleRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const unsubscribeTypingRef = useRef(null);
  const typingTimerRef = useRef(null);

  const [learnerCount, setLearnerCount] = useState(0);

  useEffect(() => {
    if (!trainingId) return;

    const unsubscribe = onSnapshot(
      doc(db, "formations", trainingId),
      (snap) => {
        const participants = snap.data()?.participants || [];
        setLearnerCount(participants.length);
      },
    );

    return () => unsubscribe();
  }, [trainingId]);

  // ─────────────────────────────────────────────────────
  // 📡 MESSAGES EN TEMPS RÉEL
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!trainingId || typeof trainingId !== "string") {
      setLoading(false);
      setError("ID de formation invalide");
      return;
    }

    setLoading(true);
    setError(null);

    if (unsubscribeRef.current) unsubscribeRef.current();

    try {
      const q = query(
        collection(db, "messages"),
        where("trainingId", "==", trainingId),
        orderBy("createdAt", "desc"),
        limit(50),
      );

      unsubscribeRef.current = onSnapshot(
        q,
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
          console.error("Erreur onSnapshot:", err);
          setError("Impossible de se connecter au chat");
          setLoading(false);
        },
      );
    } catch (err) {
      setError("Erreur de configuration du chat");
      setLoading(false);
    }

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [trainingId]);

  // ─────────────────────────────────────────────────────
  // ⌨️ ÉCOUTER LES INDICATEURS DE FRAPPE EN TEMPS RÉEL
  //
  // Collection "typing_indicators" — un doc par user/formation
  // Doc ID : "{trainingId}_{userId}"
  // On ignore les docs vieux de plus de 5 secondes (sécurité)
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!trainingId || !user?.uid) return;

    if (unsubscribeTypingRef.current) unsubscribeTypingRef.current();

    const q = query(
      collection(db, "typing_indicators"),
      where("trainingId", "==", trainingId),
      where("isTyping", "==", true),
    );

    unsubscribeTypingRef.current = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const typing = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        // Ignorer notre propre indicateur
        if (data.userId === user.uid) return;
        // Ignorer les indicateurs vieux de plus de 5 secondes
        const updatedAt = data.updatedAt?.toMillis?.() || 0;
        if (now - updatedAt < 5000) {
          typing[data.userId] = data.userName;
        }
      });

      setTypingUsers(typing);
    });

    return () => {
      if (unsubscribeTypingRef.current) unsubscribeTypingRef.current();
      // Nettoyer notre indicateur quand on quitte l'écran
      _clearTypingDoc();
    };
  }, [trainingId, user?.uid]);

  // ─────────────────────────────────────────────────────
  // ⌨️ SUPPRIMER NOTRE DOC DE FRAPPE (interne)
  // ─────────────────────────────────────────────────────
  const _clearTypingDoc = useCallback(async () => {
    if (!trainingId || !user?.uid) return;
    try {
      await deleteDoc(
        doc(db, "typing_indicators", `${trainingId}_${user.uid}`),
      );
    } catch {}
  }, [trainingId, user?.uid]);

  // ─────────────────────────────────────────────────────
  // ⌨️ METTRE À JOUR L'INDICATEUR DE FRAPPE (exposé)
  //
  // Appelé depuis ChatInput à chaque onChange :
  //   setTyping(true)  → on écrit
  //   setTyping(false) → on a fini
  // Auto-stop après 5 secondes sans appel
  // ─────────────────────────────────────────────────────
  const lastTypingUpdateRef = useRef(0);

  const setTyping = useCallback(
    async (isTyping) => {
      if (!trainingId || !user?.uid) return;

      const now = Date.now();
      // On ne met à jour Firebase que si l'état change OU si 3 secondes ont passé
      if (!isTyping || now - lastTypingUpdateRef.current > 3000) {
        lastTypingUpdateRef.current = now;
        try {
          await setDoc(
            doc(db, "typing_indicators", `${trainingId}_${user.uid}`),
            {
              trainingId,
              userId: user.uid,
              userName: user.name || user.displayName || "Utilisateur",
              isTyping,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
        } catch (err) {
          console.error(err);
        }
      }
    },
    [trainingId, user?.uid],
  );

  // ─────────────────────────────────────────────────────
  // 📖 CHARGER PLUS DE MESSAGES (pagination)
  // ─────────────────────────────────────────────────────
  const loadMoreMessages = useCallback(async () => {
    if (
      !trainingId ||
      !lastVisibleRef.current ||
      loadingMore ||
      !hasMoreMessages
    )
      return;

    setLoadingMore(true);

    try {
      const q = query(
        collection(db, "messages"),
        where("trainingId", "==", trainingId),
        orderBy("createdAt", "desc"),
        startAfter(lastVisibleRef.current),
        limit(20),
      );

      const snapshot = await getDocs(q);

      if (snapshot.docs.length > 0) {
        lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
        setHasMoreMessages(snapshot.docs.length === 20);

        const olderMessages = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || null,
          }))
          .reverse();

        // Anciens messages ajoutés AU DÉBUT du tableau
        setMessages((prev) => [...olderMessages, ...prev]);
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error("Erreur pagination:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [trainingId, loadingMore, hasMoreMessages]);

  // ─────────────────────────────────────────────────────
  // ✉️ sendMessage — VERSION FINALE
  // Remplace l'ancienne sendMessage dans useChat.js
  //
  // Signature : sendMessage(text?, replyId?, attachment?)
  //   text       → texte (optionnel si attachment présent)
  //   replyId    → ID du message cité (optionnel)
  //   attachment → { url, type: "image" | "file" } (optionnel)
  // ─────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text, replyId = null, attachment = null) => {
      if (!trainingId || !user?.uid) return;

      const trimmed = (text ?? inputText).trim();

      // Autoriser l'envoi si texte OU pièce jointe
      if (!trimmed && !attachment) return;
      if (sending) return;

      const originalText = inputText;

      try {
        setSending(true);
        setInputText("");
        await _clearTypingDoc();

        await addDoc(collection(db, "messages"), {
          trainingId,
          senderId: user.uid,
          senderName: user.name || user.displayName || "Utilisateur",
          senderRole: user.role || "learner",
          senderPhoto: user.photoURL || null,
          text: trimmed,
          createdAt: serverTimestamp(),
          pinned: false,
          status: "sent",
          readBy: [user.uid],
          reactions: [],
          // ── Nouveau ──
          replyToId: replyId || null, // ID du message cité
          attachment: attachment || null, // { url, type }
        });
      } catch (err) {
        console.error("Erreur envoi:", err);
        setError("Échec de l'envoi du message");
        setInputText(originalText);
      } finally {
        setSending(false);
      }
    },
    [trainingId, user, inputText, sending, _clearTypingDoc],
  );
  // ─────────────────────────────────────────────────────
  // 📌 ÉPINGLER / DÉSÉPINGLER
  // ─────────────────────────────────────────────────────
  const togglePin = useCallback(
    async (messageId, currentPinned) => {
      if (user?.role !== "trainer" || !messageId) return;

      try {
        await updateDoc(doc(db, "messages", messageId), {
          pinned: !currentPinned,
          pinnedBy: user.uid,
          pinnedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Erreur épinglage:", err);
        setError("Impossible d'épingler le message");
      }
    },
    [user],
  );

  // ─────────────────────────────────────────────────────
  // ✅ MARQUER COMME LU
  // ─────────────────────────────────────────────────────
  const markAsRead = useCallback(
    async (messageId) => {
      if (!user?.uid || !messageId) return;
      try {
        await updateDoc(doc(db, "messages", messageId), {
          readBy: arrayUnion(user.uid),
        });
      } catch {}
    },
    [user],
  );

  // ─────────────────────────────────────────────────────
  // 👍 RÉACTIONS — AJOUTER
  // ─────────────────────────────────────────────────────
  const addReaction = useCallback(
    async (messageId, emoji) => {
      if (!user?.uid || !messageId) return;
      try {
        await updateDoc(doc(db, "messages", messageId), {
          reactions: arrayUnion({
            userId: user.uid,
            userName: user.name || "Utilisateur",
            emoji,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("Erreur ajout réaction:", err);
      }
    },
    [user],
  );

  // ─────────────────────────────────────────────────────
  // 👎 RÉACTIONS — RETIRER
  //
  // arrayRemove Firestore nécessite l'objet EXACT stocké.
  // On cherche d'abord la réaction dans le state local
  // pour récupérer son timestamp exact, puis on la retire.
  // ─────────────────────────────────────────────────────
  const removeReaction = useCallback(
    async (messageId, emoji) => {
      if (!user?.uid || !messageId) return;

      // Trouver l'objet exact dans le state local
      const message = messages.find((m) => m.id === messageId);
      const existingReaction = message?.reactions?.find(
        (r) => r.userId === user.uid && r.emoji === emoji,
      );

      // Si la réaction n'existe pas, rien à faire
      if (!existingReaction) return;

      try {
        await updateDoc(doc(db, "messages", messageId), {
          // arrayRemove avec l'objet EXACT — Firestore fait une comparaison profonde
          reactions: arrayRemove(existingReaction),
        });
      } catch (err) {
        console.error("Erreur retrait réaction:", err);
      }
    },
    [user, messages], // messages en dépendance pour avoir les réactions à jour
  );

  // Dans ton useChat, juste avant le return
  // ─────────────────────────────────────────────────────
  // 👍 RÉACTIONS — AJOUTER/RETIRER
  //
  // arrayRemove Firestore nécessite l'objet EXACT stocké.
  const toggleReaction = useCallback(
    async (messageId, emoji) => {
      if (!user?.uid || !messageId) return;

      // 1. Trouver le message dans le state local pour voir si l'user a déjà réagi
      const message = messages.find((m) => m.id === messageId);
      const existingReaction = message?.reactions?.find(
        (r) => r.userId === user.uid && r.emoji === emoji,
      );

      try {
        const docRef = doc(db, "messages", messageId);

        if (existingReaction) {
          // 2. Si elle existe, on retire l'objet EXACT
          await updateDoc(docRef, {
            reactions: arrayRemove(existingReaction),
          });
        } else {
          // 3. Si elle n'existe pas, on ajoute un nouvel objet
          await updateDoc(docRef, {
            reactions: arrayUnion({
              userId: user.uid,
              userName: user.name || "Utilisateur",
              emoji,
              timestamp: new Date().toISOString(), // On garde ISOString pour la comparaison simple
            }),
          });
        }
      } catch (err) {
        console.error("Erreur toggleReaction:", err);
      }
    },
    [user, messages],
  );

  // ─────────────────────────────────────────────────────
  // 📊 DONNÉES DÉRIVÉES
  // ─────────────────────────────────────────────────────
  const pinnedMessages = useMemo(
    () => messages.filter((m) => m.pinned === true),
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
    messageCount: messages.length,
    lastMessage: messages[messages.length - 1] || null,
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
    typingUsers, // ✅ { userId: userName } — temps réel
    setTyping, // ✅ appeler onChange dans ChatInput
    sendMessage,
    togglePin,
    markAsRead,
    addReaction,
    removeReaction, // ✅ implémenté avec arrayRemove exact
    hasMessages: messages.length > 0,
    hasPinnedMessages: pinnedMessages.length > 0,
    toggleReaction,
  };
}
