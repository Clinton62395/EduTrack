import { db } from "@/components/lib/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

/**
 * Hook dédié aux statistiques du profil learner.
 * Calcule en temps réel :
 * - certificatesCount : nombre de certificats obtenus
 * - completedLessons  : nombre de leçons complétées
 * - averageProgression: % moyen de progression sur toutes les formations
 * - estimatedHours    : heures estimées (leçons × 15 min)
 */
export function useLearnerStats(userId, enrolledTrainingIds = []) {
  const [stats, setStats] = useState({
    certificatesCount: 0,
    completedLessons: 0,
    averageProgression: 0,
    estimatedHours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // ✅ Écoute temps réel des certificats
    const unsub = onSnapshot(
      query(collection(db, "certificates"), where("userId", "==", userId)),
      async (certSnap) => {
        try {
          const certificatesCount = certSnap.size;

          // Progression leçons
          const progressSnap = await getDocs(
            query(
              collection(db, "userProgress"),
              where("userId", "==", userId),
            ),
          );

          const completedLessons = progressSnap.docs.filter(
            (d) => d.data().type !== "quiz", // exclut les entrées quiz
          ).length;

          // Heures estimées — 15 min par leçon
          const estimatedHours = Math.round((completedLessons * 15) / 60);

          // Progression moyenne sur toutes les formations
          let averageProgression = 0;

          if (enrolledTrainingIds.length > 0) {
            // Total des leçons disponibles dans toutes les formations
            const chunks = [];
            for (let i = 0; i < enrolledTrainingIds.length; i += 10) {
              chunks.push(enrolledTrainingIds.slice(i, i + 10));
            }

            let totalLessons = 0;
            for (const trainingId of enrolledTrainingIds) {
              const modulesSnap = await getDocs(
                collection(db, "formations", trainingId, "modules"),
              );

              for (const moduleDoc of modulesSnap.docs) {
                const lessonsSnap = await getDocs(
                  collection(
                    db,
                    "formations",
                    trainingId,
                    "modules",
                    moduleDoc.id,
                    "lessons",
                  ),
                );
                totalLessons += lessonsSnap.size;
              }
            }

            averageProgression =
              totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;
          }

          setStats({
            certificatesCount,
            completedLessons,
            averageProgression,
            estimatedHours,
          });
        } catch (e) {
          console.error("useLearnerStats error:", e);
        } finally {
          setLoading(false);
        }
      },
    );

    return () => unsub();
  }, [userId, enrolledTrainingIds.join(",")]);

  return { stats, loading };
}
