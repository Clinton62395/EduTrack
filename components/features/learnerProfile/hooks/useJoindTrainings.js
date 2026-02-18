import { db } from "@/components/lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { useState } from "react";

export function useJoinTraining() {
  const [loading, setLoading] = useState(false);

  const joinByCode = async (code, userId) => {
    setLoading(true);

    try {
      // 1️⃣ Chercher la formation avec ce code
      const q = query(
        collection(db, "formations"),
        where("invitationCode", "==", code.trim().toUpperCase()),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Code invalide. Aucune formation trouvée.");
      }

      const trainingDoc = querySnapshot.docs[0];
      const trainingId = trainingDoc.id;
      const tDataInitial = trainingDoc.data();
      const trainerId = tDataInitial.trainerId; // L'ID du prof lié à la formation

      const trainingRef = doc(db, "formations", trainingId);
      const userRef = doc(db, "users", userId);
      const instructorRef = doc(db, "users", trainerId);

      // 2️⃣ Transaction atomique pour tout mettre à jour d'un coup
      await runTransaction(db, async (transaction) => {
        const trainingSnap = await transaction.get(trainingRef);
        const userSnap = await transaction.get(userRef);
        const instructorSnap = await transaction.get(instructorRef);

        if (!trainingSnap.exists()) throw new Error("Formation introuvable.");
        if (!userSnap.exists()) throw new Error("Utilisateur introuvable.");

        const tData = trainingSnap.data();
        const uData = userSnap.data();

        // Vérification si déjà inscrit
        if (uData.enrolledTrainings?.includes(trainingId)) {
          throw new Error("Vous êtes déjà inscrit à cette formation.");
        }

        // Vérification capacité
        if ((tData.currentLearners || 0) >= (tData.maxLearners || 20)) {
          throw new Error("Cette formation est déjà complète.");
        }

        // ✅ A. Inscription à la formation
        transaction.update(trainingRef, {
          participants: arrayUnion(userId),
          currentLearners: (tData.currentLearners || 0) + 1,
        });

        // ✅ B. Stats du Formateur (Compter l'élève s'il est nouveau pour ce prof)
        const myInstructors = uData.myInstructors || [];
        if (!myInstructors.includes(trainerId)) {
          const currentCount = instructorSnap.data()?.learnersCount || 0;
          transaction.update(instructorRef, {
            learnersCount: currentCount + 1,
          });
          // On ajoute le prof à la liste de l'élève pour ne pas le recompter
          transaction.update(userRef, {
            myInstructors: arrayUnion(trainerId),
          });
        }

        // ✅ C. Mise à jour du profil de l'élève
        transaction.update(userRef, {
          enrolledTrainings: arrayUnion(trainingId),
          trainingsJoinedCount: (uData.trainingsJoinedCount || 0) + 1,
          updatedAt: new Date(),
        });
      });

      return {
        success: true,
        title: tDataInitial.title,
        trainingId: trainingId,
      };
    } catch (err) {
      console.error("Join training error:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { joinByCode, loading };
}
