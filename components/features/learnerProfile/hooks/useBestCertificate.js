import { db } from "@/components/lib/firebase";
import {
    collection,
    getDocs,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

/**
 * Cherche le meilleur statut de certificat parmi toutes les formations du learner.
 * Priorité : obtained > eligible > locked
 */
export function useBestCertificate(userId, trainings) {
  const [status, setStatus] = useState("locked"); // "obtained" | "eligible" | "locked"
  const [bestFormation, setBestFormation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !trainings?.length) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Écoute en temps réel les certificats du learner
    const certQuery = query(
      collection(db, "certificates"),
      where("userId", "==", userId),
    );

    const unsub = onSnapshot(certQuery, async (certSnap) => {
      try {
        const certTrainingIds = certSnap.docs.map((d) => d.data().trainingId);

        // Priorité 1 — certificat déjà obtenu
        for (const training of trainings) {
          if (certTrainingIds.includes(training.id)) {
            setStatus("obtained");
            setBestFormation(training);
            setLoading(false);
            return;
          }
        }

        // Priorité 2 — éligible (toutes leçons complétées)
        const progressSnap = await getDocs(
          query(collection(db, "userProgress"), where("userId", "==", userId)),
        );
        const completedLessons = progressSnap.docs.map((d) => ({
          lessonId: d.data().lessonId,
          trainingId: d.data().trainingId,
        }));

        for (const training of trainings) {
          const modulesSnap = await getDocs(
            collection(db, "formations", training.id, "modules"),
          );
          const modules = modulesSnap.docs.map((d) => ({ id: d.id }));
          if (!modules.length) continue;

          let allDone = true;
          for (const mod of modules) {
            const lessonsSnap = await getDocs(
              collection(
                db,
                "formations",
                training.id,
                "modules",
                mod.id,
                "lessons",
              ),
            );
            const lessonIds = lessonsSnap.docs.map((d) => d.id);
            const completedInTraining = completedLessons
              .filter((l) => l.trainingId === training.id)
              .map((l) => l.lessonId);

            if (!lessonIds.every((id) => completedInTraining.includes(id))) {
              allDone = false;
              break;
            }
          }

          if (allDone) {
            setStatus("eligible");
            setBestFormation(training);
            setLoading(false);
            return;
          }
        }

        // Priorité 3 — aucune formation complète
        setStatus("locked");
        setBestFormation(trainings[0]);
        setLoading(false);
      } catch (e) {
        console.error("useBestCertificate error:", e);
        setLoading(false);
      }
    });

    return () => unsub();
  }, [userId, trainings]);

  return { status, bestFormation, loading };
}
