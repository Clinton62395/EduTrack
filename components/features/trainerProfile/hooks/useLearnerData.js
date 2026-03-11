import { db } from "@/components/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

/**
 * Charge les élèves d'une formation avec leur progression.
 */
export function useLearnersData(trainingId) {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trainingId) {
      setLearners([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsub = onSnapshot(
      doc(db, "formations", trainingId),
      async (trainingDoc) => {
        if (!trainingDoc.exists()) {
          setLoading(false);
          return;
        }

        const participants = trainingDoc.data()?.participants || [];

        // participants peut être un tableau d'objets {uid} ou de strings
        const participantIds = participants.map((p) =>
          typeof p === "string" ? p : p.uid,
        );

        if (participantIds.length === 0) {
          setLearners([]);
          setLoading(false);
          return;
        }

        try {
          // ✅ Firestore "in" limite à 30 — on découpe si nécessaire
          const chunks = [];
          for (let i = 0; i < participantIds.length; i += 30) {
            chunks.push(participantIds.slice(i, i + 30));
          }

          const usersSnaps = await Promise.all(
            chunks.map((chunk) =>
              getDocs(
                query(
                  collection(db, "users"),
                  where("__name__", "in", chunk),
                ),
              ),
            ),
          );

          const allUserDocs = usersSnaps.flatMap((snap) => snap.docs);

          // Progression de chaque élève en parallèle
          const learnersWithProgress = await Promise.all(
            allUserDocs.map(async (uDoc) => {
              const progressSnap = await getDocs(
                query(
                  collection(db, "userProgress"),
                  where("userId", "==", uDoc.id),
                  where("trainingId", "==", trainingId),
                ),
              );
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
      },
    );

    return () => unsub();
  }, [trainingId]);

  return { learners, loading };
}