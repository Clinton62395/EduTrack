import { db } from "@/components/lib/firebase";
import {
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "@react-native-firebase/firestore";
import { useState } from "react";

export function useToggleModule() {
  const [toggleLoading, setToggleLoading] = useState(false);

  const toggleStatus = async (userId, trainingId, moduleId, isCompleted) => {
    setToggleLoading(true);

    const progressRef = doc(db, "userProgress", `${userId}_${moduleId}`);
    const userRef = doc(db, "users", userId);

    try {
      if (!isCompleted) {
        // ✅ Marquer comme terminé
        await setDoc(progressRef, {
          userId,
          trainingId,
          moduleId,
          status: "completed",
          completedAt: serverTimestamp(),
        });
        await updateDoc(userRef, {
          modulesCompletedCount: increment(1),
        });
      } else {
        // ❌ Décocher
        await deleteDoc(progressRef);
        await updateDoc(userRef, {
          modulesCompletedCount: increment(-1),
        });
      }
      return true;
    } catch (error) {
      console.error("Erreur toggle module:", error);
      return false;
    } finally {
      setToggleLoading(false);
    }
  };

  return { toggleStatus, toggleLoading };
}
