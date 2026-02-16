import { db } from "@/components/lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";

export function useJoinTraining() {
  const [loading, setLoading] = useState(false);

  const joinByCode = async (code, userId) => {
    setLoading(true);
    try {
      // 1. Chercher la formation avec ce code
      const q = query(
        collection(db, "formations"),
        where("invitationCode", "==", code.toUpperCase()),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Code invalide. Aucune formation trouvée.");
      }

      const trainingDoc = querySnapshot.docs[0];
      const trainingData = trainingDoc.data();
      const trainingId = trainingDoc.id;

      // 2. Vérifications de sécurité
      if (trainingData.participants?.includes(userId)) {
        throw new Error("Vous êtes déjà inscrit à cette formation.");
      }

      if (trainingData.currentLearners >= trainingData.maxLearners) {
        throw new Error("Cette formation est déjà complète.");
      }

      // 3. Inscription : On ajoute l'utilisateur et on incrémente le compteur
      const trainingRef = doc(db, "formations", trainingId);
      await updateDoc(trainingRef, {
        participants: arrayUnion(userId),
        currentLearners: increment(1),
      });

      return {
        success: true,
        title: trainingData.title,
        trainingId: trainingId,
      };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { joinByCode, loading };
}
