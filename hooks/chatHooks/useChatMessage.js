import { db } from "@/components/lib/firebase";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chatStorage } from "../../components/helpers/chatHelper/storage";

// ─────────────────────────────────────────
// MMKV CACHE
// ─────────────────────────────────────────

const CACHE_TTL = 1000 * 60 * 30;

const getCacheKey = (trainingId) => `chat_messages_${trainingId}`;

const storage= chatStorage
function saveMessagesToCache(trainingId, messages) {
  if (!trainingId) return;
  try {
    storage.set(
      getCacheKey(trainingId),
      JSON.stringify({ messages, savedAt: Date.now() }),
    );
  } catch (e) {
    console.warn("MMKV write error", e);
  }
}

function loadMessagesFromCache(trainingId) {
  if (!trainingId) return null;
  try {
    const raw =  storage.getString(getCacheKey(trainingId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.savedAt > CACHE_TTL) {
      storage.remove(getCacheKey(trainingId));
      return null;
    }
    return parsed.messages;
  } catch (e) {
    console.warn("MMKV read error", e);
    return null;
  }
}

function clearChatCache(trainingId) {
  if (!trainingId) return;
  try {
     storage.remove(getCacheKey(trainingId));
  } catch (e) {
    console.warn("MMKV delete error", e);
  }
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const PAGE_SIZE = 50;
const LOAD_MORE_SIZE = 20;

const chatColRef = (trainingId) =>
  collection(db, "formations", trainingId, "chat");

const serializeMessage = (d) => ({
  id: d.id,
  ...d.data(),
  createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
});

const deserializeMessage = (m) => ({
  ...m,
  createdAt: m.createdAt ? new Date(m.createdAt) : null,
});

// ─────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────

export function useChat(trainingId, user) {
  // ✅ MMKV est synchrone — on hydrate directement
  const [messages, setMessages] = useState([]);
  const [cacheLoaded, setCacheLoaded] = useState(false);

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

  // ─────────────────────────────────────────
  // HYDRATATION CACHE AU MONTAGE
  // ─────────────────────────────────────────

 useEffect(() => {
  if (!trainingId) {
    setCacheLoaded(true);
    return;
  }
  // ✅ Synchrone directement
  const cached = loadMessagesFromCache(trainingId);
  if (cached && cached.length > 0) {
    setMessages(cached.map(deserializeMessage));
    setLoading(false);
  }
  setCacheLoaded(true);
}, [trainingId]);

  // ─────────────────────────────────────────
  // PARTICIPANTS TEMPS RÉEL
  // ─────────────────────────────────────────

  useEffect(() => {
    if (!trainingId) return;

    const unsub = onSnapshot(doc(db, "formations", trainingId), (snap) => {
      setLearnerCount(snap.data()?.participants?.length || 0);
    });

    return () => unsub();
  }, [trainingId]);

  // ─────────────────────────────────────────
  // CHAT TEMPS RÉEL — démarre après hydratation cache
  // ─────────────────────────────────────────

  useEffect(() => {
    if (!trainingId || !cacheLoaded) return;

    setLoading(true);

    if (unsubscribeChatRef.current) {
      unsubscribeChatRef.current();
    }

    const q = query(
      chatColRef(trainingId),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE),
    );

    unsubscribeChatRef.current = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot) return;

        if (snapshot.docs.length > 0) {
          lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
          setHasMoreMessages(snapshot.docs.length === PAGE_SIZE);
        } else {
          setHasMoreMessages(false);
        }

        const data = snapshot.docs.map(serializeMessage).reverse();

        saveMessagesToCache(trainingId, data); // ✅ fire and forget, pas besoin d'await
        setMessages(data.map(deserializeMessage));
        setLoading(false);
      },
      (err) => {
        console.error("Chat Error:", err);
        setError("Erreur connexion chat");
        setLoading(false);
      },
    );

    return () => unsubscribeChatRef.current?.();
  }, [trainingId, cacheLoaded]);

  // ─────────────────────────────────────────
  // TYPING INDICATOR
  // ─────────────────────────────────────────

  useEffect(() => {
    if (!trainingId || !user?.uid) return;

    const unsub = onSnapshot(
      query(
        collection(db, "typing_indicators"),
        where("trainingId", "==", trainingId),
        where("isTyping", "==", true),
      ),
      (snapshot) => {
        const typing = {};
        snapshot.docs.forEach((d) => {
          const data = d.data();
          if (data.userId !== user.uid) {
            typing[data.userId] = data.userName;
          }
        });
        setTypingUsers(typing);
      },
    );

    return () => unsub();
  }, [trainingId, user?.uid]);

  // ─────────────────────────────────────────
  // PAGINATION
  // ─────────────────────────────────────────

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
      const snapshot = await getDocs(
        query(
          chatColRef(trainingId),
          orderBy("createdAt", "desc"),
          startAfter(lastVisibleRef.current),
          limit(LOAD_MORE_SIZE),
        ),
      );

      if (snapshot.docs.length > 0) {
        lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
        setHasMoreMessages(snapshot.docs.length === LOAD_MORE_SIZE);
        const older = snapshot.docs.map(serializeMessage).reverse();
        setMessages((prev) => [...older.map(deserializeMessage), ...prev]);
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error("LoadMore Error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [trainingId, loadingMore, hasMoreMessages]);

  // ─────────────────────────────────────────
  // ENVOI MESSAGE
  // ─────────────────────────────────────────

  const sendMessage = useCallback(
    async (text, replyId = null, attachment = null) => {
      if (!trainingId || !user?.uid) return;

      const trimmed = (text ?? inputText).trim();

      if (!trimmed && !attachment) return;
      if (sending) return;

      try {
        setSending(true);
        setInputText("");

        await addDoc(chatColRef(trainingId), {
          senderId: user.uid,
          senderName: user.name || "Utilisateur",
          senderRole: user.role || "learner",
          senderAvatar: user.avatar || null,
          text: trimmed,
          createdAt: serverTimestamp(),
          pinned: false,
          readBy: [user.uid],
          reactions: [],
          replyToId: replyId || null,
          attachment: attachment || null,
          trainingId,
        });
      } catch (err) {
        console.error("Send Message Error:", err);
        setError("Échec envoi message");
      } finally {
        setSending(false);
      }
    },
    [trainingId, user, inputText, sending],
  );

  // ─────────────────────────────────────────
  // REACTION
  // ─────────────────────────────────────────

  const toggleReaction = useCallback(
    async (messageId, emoji) => {
      if (!trainingId || !user?.uid) return;

      const message = messages.find((m) => m.id === messageId);
      const existing = message?.reactions?.find(
        (r) => r.userId === user.uid && r.emoji === emoji,
      );

      try {
        await updateDoc(doc(db, "formations", trainingId, "chat", messageId), {
          reactions: existing
            ? arrayRemove(existing)
            : arrayUnion({
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
    [trainingId, user, messages],
  );

  // ─────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────

  const markAsRead = useCallback(
    async (messageId) => {
      if (!trainingId || !user?.uid) return;
      try {
        await updateDoc(doc(db, "formations", trainingId, "chat", messageId), {
          readBy: arrayUnion(user.uid),
        });
      } catch (err) {
        console.error("Read Error:", err);
      }
    },
    [trainingId, user?.uid],
  );

  // ─────────────────────────────────────────
  // PIN
  // ─────────────────────────────────────────

  const togglePin = useCallback(
    async (messageId, pinned) => {
      if (!trainingId) return;
      try {
        await updateDoc(doc(db, "formations", trainingId, "chat", messageId), {
          pinned,
        });
      } catch (err) {
        console.error("Pin Error:", err);
      }
    },
    [trainingId],
  );

  // ─────────────────────────────────────────
  // DERIVED DATA
  // ─────────────────────────────────────────

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
    clearChatCache: () => clearChatCache(trainingId),
  };
}
