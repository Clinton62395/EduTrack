import { db } from "@/components/lib/firebase";
import { useEffect, useState } from "react";
// firestore via db methods

/**
 * Charge les élèves d'une formation spécifique avec leur progression.
 * Si trainingId est null, ne charge rien.
 *
 * @param {string|null} trainingId
 */
export function useLearnersData(trainingId) {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pas de formation sélectionnée → on n'affiche rien
    if (!trainingId) {
      setLearners([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const ref = db.collection("formations").doc(trainingId);
    const unsub = ref.onSnapshot(async (trainingDoc) => {
      if (!trainingDoc.exists()) {
        setLoading(false);
        return;
      }

      const participantIds = trainingDoc.data()?.participants || [];

      if (participantIds.length === 0) {
        setLearners([]);
        setLoading(false);
        return;
      }

      try {
        // Profils des participants
        const usersSnap = await db
          .collection("users")
          .where("__name__", "in", participantIds)
          .get();

        // Progression de chaque élève
        const learnersWithProgress = await Promise.all(
          usersSnap.docs.map(async (uDoc) => {
            const progressSnap = await db
              .collection("userProgress")
              .where("userId", "==", uDoc.id)
              .where("trainingId", "==", trainingId)
              .get();

            return {
              id: uDoc.id,
              ...uDoc.data(),
              completedLessons: progressSnap.size,
            };
          }),
        );

        setLearners(learnersWithProgress);
      } catch (error) {
        console.error("Erreur chargement élèves:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [trainingId]);

  return { learners, loading };
}
