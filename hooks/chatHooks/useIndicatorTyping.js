import { db } from "@/components/lib/firebase"; // Instance firestore() native
import firestore from "@react-native-firebase/firestore";
import { useEffect, useRef, useState } from "react";

const TYPING_TIMEOUT_MS = 2000;

export function useChatTyping(trainingId, user) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimerRef = useRef(null);

  // 📝 Helper pour mettre à jour Firestore (Atomique)
  const setTypingInFirestore = async (typing) => {
    if (!user?.uid || !trainingId) return;
    
    const typingRef = db.collection("typing_indicators").doc(user.uid);
    
    try {
      // ✅ .set(..., { merge: true }) est plus propre qu'un try/catch update
      await typingRef.set({
        trainingId,
        userId: user.uid,
        userName: user.name || "Utilisateur",
        isTyping: typing,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error("Erreur Typing Indicator:", err);
    }
  };

  // ⏱️ Debounce — Reset auto après 2s sans frappe
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

  // 🧹 Reset immédiat (ex: après envoi du message)
  const resetTyping = () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setIsTyping(false);
    setTypingInFirestore(false);
  };

  // 🚿 Cleanup au démontage (Native)
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (user?.uid) {
        // Version "fire and forget" pour le démontage
        db.collection("typing_indicators").doc(user.uid)
          .update({ isTyping: false })
          .catch(() => {});
      }
    };
  }, [user?.uid]);

  // 📡 Écoute des autres participants (Realtime)
  useEffect(() => {
    if (!trainingId) return;

    const unsubscribe = db.collection("typing_indicators")
      .where("trainingId", "==", trainingId)
      .where("isTyping", "==", true)
      .onSnapshot((snapshot) => {
        if (!snapshot) return;
        
        const typing = {};
        snapshot.docs.forEach((d) => {
          const data = d.data();
          if (data.userId !== user?.uid) {
            typing[data.userId] = data.userName;
          }
        });
        setTypingUsers(typing);
      }, (err) => {
        console.error("Erreur Listen Typing:", err);
      });

    return () => unsubscribe();
  }, [trainingId, user?.uid]);

  return { isTyping, typingUsers, updateTypingStatus, resetTyping };
}
