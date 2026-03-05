import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import { useEffect, useRef, useState } from "react"; // ← ajouter useRef
// Firestore operations use db; FieldValue via firestore.FieldValue

const TYPING_TIMEOUT_MS = 2000;

export function useChatTyping(trainingId, user) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimerRef = useRef(null); // ← AJOUTER

  const setTypingInFirestore = async (typing) => {
    if (!user?.uid || !trainingId) return;
    const typingRef = db.collection("typing_indicators").doc(user.uid);
    const payload = {
      trainingId,
      userId: user.uid,
      userName: user.name || "Utilisateur",
      isTyping: typing,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };
    try {
      await typingRef.update(payload);
    } catch {
      await typingRef.set(payload);
    }
  };

  // ✅ Debounce — reset auto après 2s sans frappe
  const updateTypingStatus = (typing) => {
    setIsTyping(typing);
    if (typing) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setTypingInFirestore(true);
      typingTimerRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingInFirestore(false);
      }, TYPING_TIMEOUT_MS);
    } else {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setTypingInFirestore(false);
    }
  };

  // ✅ NOUVEAU — reset immédiat après envoi
  const resetTyping = () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setIsTyping(false);
    setTypingInFirestore(false);
  };

  // ✅ Cleanup au démontage
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (!user?.uid || !trainingId) return;
      const ref = db.collection("typing_indicators").doc(user.uid);
      ref.update({ isTyping: false }).catch(() =>
        ref.set({
          trainingId,
          userId: user.uid,
          userName: user.name || "",
          isTyping: false,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }),
      );
    };
  }, [trainingId, user?.uid]); // eslint-disable-line

  // Écoute des autres
  useEffect(() => {
    if (!trainingId) return;
    const q = db
      .collection("typing_indicators")
      .where("trainingId", "==", trainingId)
      .where("isTyping", "==", true);
    const unsubscribe = q.onSnapshot((snapshot) => {
      const typing = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.userId !== user?.uid) typing[data.userId] = data.userName;
      });
      setTypingUsers(typing);
    });
    return () => unsubscribe();
  }, [trainingId, user?.uid]);

  return { isTyping, typingUsers, updateTypingStatus, resetTyping }; // ← resetTyping exporté
}
