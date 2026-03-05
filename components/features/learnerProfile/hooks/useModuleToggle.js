import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
// firestore via db; FieldValue via firestore.FieldValue

export function useToggleModule() {
  const [toggleLoading, setToggleLoading] = useState(false);

  const toggleStatus = async (userId, trainingId, moduleId, isCompleted) => {
    setToggleLoading(true);

    // Chemin unique pour le progrès : utilisateur_module
    const progressId = `${userId}_${moduleId}`;
    const progressRef = db.collection("userProgress").doc(progressId);
    const userRef = db.collection("users").doc(userId);

    try {
      if (!isCompleted) {
        // ✅ 1. MARQUER COMME TERMINÉ
        await progressRef.set({
          userId,
          trainingId,
          moduleId,
          status: "completed",
          completedAt: firestore.FieldValue.serverTimestamp(),
        });

        // 📈 2. UPDATE STATS PROFIL (Incrémentation)
        await userRef.update({
          modulesCompletedCount: firestore.FieldValue.increment(1),
          // Optionnel : moyenne de progression (calcul plus complexe à faire ici ou via Cloud Function)
        });
      } else {
        // ❌ 1. DÉCOCHER (Supprimer le document de progrès)
        await progressRef.delete();

        // 📉 2. UPDATE STATS PROFIL (Décrémentation)
        await userRef.update({
          modulesCompletedCount: firestore.FieldValue.increment(-1),
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
