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
      // 1️⃣ Recherche de la formation par son code d'invitation
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
        const [tSnap, uSnap, iSnap] = await Promise.all([
          transaction.get(trainingRef),
          transaction.get(userRef),
          transaction.get(instructorRef),
        ]);

        if (!tSnap.exists() || !uSnap.exists() || !iSnap.exists()) {
          throw new Error("Données introuvables lors de l'inscription.");
        }

        const tData = tSnap.data();
        const uData = uSnap.data();

        // 🛡️ VÉRIFICATIONS
        if (tData.status !== "published") {
          throw new Error("Cette formation n'est pas encore disponible.");
        }

        if (!tData.codeActive) {
          throw new Error("Ce code d'invitation n'est plus actif.");
        }

        // ✅ Vérification simplifiée : on cherche l'ID dans le tableau simple
        if (tData.participants?.includes(userId)) {
          throw new Error("Vous suivez déjà cette formation.");
        }

        if ((tData.currentLearners || 0) >= (tData.maxLearners || 25)) {
          throw new Error("Quota d'élèves atteint.");
        }

        // ✅ A. Mise à jour de la formation : on envoie juste l'ID (userId)
        transaction.update(trainingRef, {
          participants: arrayUnion(userId), // <--- TABLEAU SIMPLE ICI
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
