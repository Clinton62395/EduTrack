import { db } from "@/components/lib/firebase";
import { useState } from "react";
// firestore via db methods

export function useJoinTraining() {
  const [loading, setLoading] = useState(false);

  const joinByCode = async (code, userId) => {
    setLoading(true);

    try {
      // 1️⃣ Chercher la formation avec ce code
      const q = db
        .collection("formations")
        .where("invitationCode", "==", code.trim().toUpperCase());
      const querySnapshot = await q.get();

      if (querySnapshot.empty) {
        throw new Error("Code invalide. Aucune formation trouvée.");
      }

      const trainingDoc = querySnapshot.docs[0];
      const trainingId = trainingDoc.id;
      const tDataInitial = trainingDoc.data();
      const trainerId = tDataInitial.trainerId;

      const trainingRef = db.collection("formations").doc(trainingId);
      const userRef = db.collection("users").doc(userId);
      const instructorRef = db.collection("users").doc(trainerId);

      // 2️⃣ Transaction atomique
      await db.runTransaction(async (transaction) => {
        const trainingSnap = await transaction.get(trainingRef);
        const userSnap = await transaction.get(userRef);
        const instructorSnap = await transaction.get(instructorRef);

        if (!trainingSnap.exists()) throw new Error("Formation introuvable.");
        if (!userSnap.exists()) throw new Error("Utilisateur introuvable.");

        const tData = trainingSnap.data();
        const uData = userSnap.data();

        // Vérification si déjà inscrit (on vérifie toujours via l'ID simple dans le profil user)
        if (uData.enrolledTrainings?.includes(trainingId)) {
          throw new Error("Vous êtes déjà inscrit à cette formation.");
        }

        if ((tData.currentLearners || 0) >= (tData.maxLearners || 20)) {
          throw new Error("Cette formation est déjà complète.");
        }

        // 🌟 NOUVEAU : On prépare l'objet participant "riche"
        // On stocke le token ICI pour éviter de le chercher plus tard
        const newParticipant = {
          uid: userId,
          name: uData.name || uData.displayName || "Apprenant",
          expoPushToken: uData.expoPushToken || null,
          photoURL: uData.photoURL || null,
          joinedAt: new Date().toISOString(),
        };

        // ✅ A. Inscription à la formation (MAJ du tableau d'objets)
        // Note: On utilise le spread operator pour ajouter à la liste existante dans la transaction
        const updatedParticipants = [
          ...(tData.participants || []),
          newParticipant,
        ];

        transaction.update(trainingRef, {
          participants: updatedParticipants,
          currentLearners: (tData.currentLearners || 0) + 1,
        });

        // ✅ B. Stats du Formateur
        const myInstructors = uData.myInstructors || [];
        if (!myInstructors.includes(trainerId)) {
          const currentCount = instructorSnap.data()?.learnersCount || 0;
          transaction.update(instructorRef, {
            learnersCount: currentCount + 1,
          });
          transaction.update(userRef, {
            myInstructors: [...myInstructors, trainerId],
          });
        }

        // ✅ C. Mise à jour du profil de l'élève
        const enrolled = uData.enrolledTrainings || [];
        transaction.update(userRef, {
          enrolledTrainings: [...enrolled, trainingId],
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
