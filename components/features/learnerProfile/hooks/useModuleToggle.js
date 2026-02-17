import { db } from "@/components/lib/firebase";
import {
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useState } from "react";

export function useToggleModule() {
  const [toggleLoading, setToggleLoading] = useState(false);

  const toggleStatus = async (userId, trainingId, moduleId, isCompleted) => {
    setToggleLoading(true);

    // Chemin unique pour le progrès : utilisateur_module
    const progressId = `${userId}_${moduleId}`;
    const progressRef = doc(db, "userProgress", progressId);
    const userRef = doc(db, "users", userId);

    try {
      if (!isCompleted) {
        // ✅ 1. MARQUER COMME TERMINÉ
        await setDoc(progressRef, {
          userId,
          trainingId,
          moduleId,
          status: "completed",
          completedAt: serverTimestamp(),
        });

        // 📈 2. UPDATE STATS PROFIL (Incrémentation)
        await updateDoc(userRef, {
          modulesCompletedCount: increment(1),
          // Optionnel : moyenne de progression (calcul plus complexe à faire ici ou via Cloud Function)
        });
      } else {
        // ❌ 1. DÉCOCHER (Supprimer le document de progrès)
        await deleteDoc(progressRef);

        // 📉 2. UPDATE STATS PROFIL (Décrémentation)
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
