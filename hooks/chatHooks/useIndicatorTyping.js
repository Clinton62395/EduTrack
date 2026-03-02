import { db } from "@/components/lib/firebase";
import {
    collection,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useChatTyping(trainingId, user) {
  // ✅ Utilisateur actuel
  const [isTyping, setIsTyping] = useState(false);

  // ✅ Autres utilisateurs qui tapent
  const [typingUsers, setTypingUsers] = useState({});

  // 🔄 Mettre à jour l'état de frappe de l'utilisateur actuel
  const updateTypingStatus = async (typing) => {
    setIsTyping(typing);
    if (!user?.uid || !trainingId) return;

    const typingRef = doc(db, "typing_indicators", user.uid);
    try {
      await updateDoc(typingRef, {
        trainingId,
        userId: user.uid,
        userName: user.name || "Utilisateur",
        isTyping: typing,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      // Si le doc n'existe pas, on le crée
      await setDoc(typingRef, {
        trainingId,
        userId: user.uid,
        userName: user.name || "Utilisateur",
        isTyping: typing,
        updatedAt: serverTimestamp(),
      });
    }
  };

  // 🔄 Écouter les autres utilisateurs qui tapent
  useEffect(() => {
    if (!trainingId) return;

    const q = query(
      collection(db, "typing_indicators"),
      where("trainingId", "==", trainingId),
      where("isTyping", "==", true),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typing = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.userId !== user?.uid) {
          typing[data.userId] = data.userName;
        }
      });
      setTypingUsers(typing);
    });

    return () => unsubscribe();
  }, [trainingId, user?.uid]);

  return { isTyping, typingUsers, updateTypingStatus };
}
