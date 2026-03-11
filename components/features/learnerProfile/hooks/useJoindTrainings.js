import { db } from "@/components/lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "@react-native-firebase/firestore";
import { useState } from "react";

export function useJoinTraining() {
  const [loading, setLoading] = useState(false);

  const joinByCode = async (code, userId) => {
    if (!code || !userId)
      return { success: false, message: "Données manquantes." };

    setLoading(true);
    try {
      // 1️⃣ Recherche de la formation par code
      const querySnapshot = await getDocs(
        query(
          collection(db, "formations"),
          where("invitationCode", "==", code.trim().toUpperCase()),
          limit(1),
        ),
      );

      if (querySnapshot.empty) {
        throw new Error("Code invalide ou formation inexistante.");
      }

      const trainingDoc = querySnapshot.docs[0];
      const trainingId = trainingDoc.id;
      const trainerId = trainingDoc.data().trainerId;

      const trainingRef = doc(db, "formations", trainingId);
      const userRef = doc(db, "users", userId);
      const instructorRef = doc(db, "users", trainerId);

      // 2️⃣ TRANSACTION ATOMIQUE
      const result = await runTransaction(db, async (transaction) => {
        const [tSnap, uSnap] = await Promise.all([
          transaction.get(trainingRef),
          transaction.get(userRef),
        ]);

        if (!tSnap.exists() || !uSnap.exists()) {
          throw new Error("Données introuvables lors de l'inscription.");
        }

        const tData = tSnap.data();
        const uData = uSnap.data();

        // 🛡️ VÉRIFICATIONS DE SÉCURITÉ

        // ✅ La formation doit être publiée
        if (tData.status !== "published") {
          throw new Error(
            "Cette formation n'est pas encore disponible. Contactez votre formateur.",
          );
        }

        // ✅ Le code doit être actif
        if (!tData.codeActive) {
          throw new Error(
            "Ce code d'invitation n'est plus actif. Contactez votre formateur.",
          );
        }

        // ✅ Pas déjà inscrit
        if (uData.enrolledTrainings?.includes(trainingId)) {
          throw new Error("Vous suivez déjà cette formation.");
        }

        // ✅ Quota non atteint
        if ((tData.currentLearners || 0) >= (tData.maxLearners || 25)) {
          throw new Error("Quota d'élèves atteint pour cette session.");
        }

        // 🌟 Objet participant enrichi
        const newParticipant = {
          uid: userId,
          name: uData.name || "Apprenant",
          expoPushToken: uData.expoPushToken || null,
          photoURL: uData.avatar || uData.photoURL || null,
          joinedAt: new Date().toISOString(),
        };

        // ✅ A. Mise à jour de la formation
        transaction.update(trainingRef, {
          participants: arrayUnion(newParticipant),
          currentLearners: increment(1),
        });

        // ✅ B. Mise à jour du formateur (stats globales)
        const myInstructors = uData.myInstructors || [];
        if (!myInstructors.includes(trainerId)) {
          transaction.update(instructorRef, {
            learnersCount: increment(1),
          });
          transaction.update(userRef, {
            myInstructors: arrayUnion(trainerId),
          });
        }

        // ✅ C. Mise à jour du profil de l'élève
        transaction.update(userRef, {
          enrolledTrainings: arrayUnion(trainingId),
          trainingsJoinedCount: increment(1),
          updatedAt: serverTimestamp(),
        });

        return { title: tData.title };
      });

      return { success: true, title: result.title, trainingId };
    } catch (err) {
      console.error("Join Transaction Error:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { joinByCode, loading };
}
