import { db } from "@/components/lib/firebase"; // Instance native
import firestore from "@react-native-firebase/firestore"; // Pour les FieldValues
import { useState } from "react";

/**
 * Hook gérant l'inscription d'un élève à une formation via un code d'invitation.
 * Utilise une transaction pour assurer la cohérence entre l'élève, la formation et le formateur.
 */
export function useJoinTraining() {
  const [loading, setLoading] = useState(false);

  const joinByCode = async (code, userId) => {
    if (!code || !userId)
      return { success: false, message: "Données manquantes." };
    setLoading(true);

    try {
      // 1️⃣ Recherche de la formation par code (Query native)
      const querySnapshot = await db
        .collection("formations")
        .where("invitationCode", "==", code.trim().toUpperCase())
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        throw new Error("Code invalide ou formation inexistante.");
      }

      const trainingDoc = querySnapshot.docs[0];
      const trainingId = trainingDoc.id;
      const trainerId = trainingDoc.data().trainerId;

      const trainingRef = db.collection("formations").doc(trainingId);
      const userRef = db.collection("users").doc(userId);
      const instructorRef = db.collection("users").doc(trainerId);

      // 2️⃣ TRANSACTION ATOMIQUE NATIVE
      // db.runTransaction est plus robuste en natif pour gérer les micro-conflits réseau
      const result = await db.runTransaction(async (transaction) => {
        const [tSnap, uSnap, iSnap] = await Promise.all([
          transaction.get(trainingRef),
          transaction.get(userRef),
          transaction.get(instructorRef),
        ]);

        if (!tSnap.exists || !uSnap.exists) {
          throw new Error("Données introuvables lors de l'inscription.");
        }

        const tData = tSnap.data();
        const uData = uSnap.data();

        // 🛡️ Vérifications de sécurité
        if (uData.enrolledTrainings?.includes(trainingId)) {
          throw new Error("Vous suivez déjà cette formation.");
        }

        if ((tData.currentLearners || 0) >= (tData.maxLearners || 25)) {
          throw new Error("Quota d'élèves atteint pour cette session.");
        }

        // 🌟 Préparation de l'objet participant "riche"
        const newParticipant = {
          uid: userId,
          name: uData.name || "Apprenant",
          expoPushToken: uData.expoPushToken || null, // Important pour useAttendance
          photoURL: uData.avatar || uData.photoURL || null,
          joinedAt: new Date().toISOString(),
        };

        // ✅ A. Mise à jour de la Formation (Tableau d'objets)
        transaction.update(trainingRef, {
          participants: firestore.FieldValue.arrayUnion(newParticipant),
          currentLearners: firestore.FieldValue.increment(1),
        });

        // ✅ B. Mise à jour du Formateur (Stats globales)
        const myInstructors = uData.myInstructors || [];
        if (!myInstructors.includes(trainerId)) {
          transaction.update(instructorRef, {
            learnersCount: firestore.FieldValue.increment(1),
          });
          transaction.update(userRef, {
            myInstructors: firestore.FieldValue.arrayUnion(trainerId),
          });
        }

        // ✅ C. Mise à jour du profil de l'élève
        transaction.update(userRef, {
          enrolledTrainings: firestore.FieldValue.arrayUnion(trainingId),
          trainingsJoinedCount: firestore.FieldValue.increment(1),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        return { title: tData.title };
      });

      return {
        success: true,
        title: result.title,
        trainingId: trainingId,
      };
    } catch (err) {
      console.error("Native Join Transaction Error:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { joinByCode, loading };
}
