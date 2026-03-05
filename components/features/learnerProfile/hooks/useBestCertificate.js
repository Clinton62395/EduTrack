import { db } from "@/components/lib/firebase";
import { useEffect, useMemo, useRef, useState } from "react";
// firestore via db methods

/**
 * Cherche le meilleur statut de certificat parmi toutes les formations du learner.
 * Priorité : obtained > eligible > locked
 *
 * FIX : on stabilise la dépendance `trainings` en mémorisant leurs IDs
 * pour éviter la boucle infinie de re-render.
 */
export function useBestCertificate(userId, trainings) {
  const [status, setStatus] = useState("locked");
  const [bestFormation, setBestFormation] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Stabilise la liste — on ne réagit que si les IDs changent réellement
  const trainingIds = useMemo(
    () => trainings?.map((t) => t.id).join(",") ?? "",
    [trainings],
  );

  // Ref pour accéder aux trainings dans le callback sans les mettre en dépendance
  const trainingsRef = useRef(trainings);
  useEffect(() => {
    trainingsRef.current = trainings;
  }, [trainings]);

  useEffect(() => {
    if (!userId || !trainingIds) {
      setStatus("locked");
      setBestFormation(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const certQuery = db
      .collection("certificates")
      .where("userId", "==", userId);

    const unsub = certQuery.onSnapshot(async (certSnap) => {
      try {
        const currentTrainings = trainingsRef.current ?? [];
        const certTrainingIds = certSnap.docs.map((d) => d.data().trainingId);

        // Priorité 1 — certificat déjà obtenu
        for (const training of currentTrainings) {
          if (certTrainingIds.includes(training.id)) {
            setStatus("obtained");
            setBestFormation(training);
            setLoading(false);
            return;
          }
        }

        // Priorité 2 — éligible (toutes leçons complétées)
        const progressSnap = await db
          .collection("userProgress")
          .where("userId", "==", userId)
          .get();

        const completedLessons = progressSnap.docs.map((d) => ({
          lessonId: d.data().lessonId,
          trainingId: d.data().trainingId,
        }));

        for (const training of currentTrainings) {
          const modulesSnap = await db
            .collection("formations")
            .doc(training.id)
            .collection("modules")
            .get();
          const modules = modulesSnap.docs.map((d) => ({ id: d.id }));

          if (!modules.length) continue;

          let allDone = true;

          for (const mod of modules) {
            const lessonsSnap = await db
              .collection("formations")
              .doc(training.id)
              .collection("modules")
              .doc(mod.id)
              .collection("lessons")
              .get();

            const lessonIds = lessonsSnap.docs.map((d) => d.id);
            if (!lessonIds.length) continue; // module sans leçons → on ignore

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

        // Priorité 3 — rien de complété
        setStatus("locked");
        setBestFormation(currentTrainings[0] ?? null);
        setLoading(false);
      } catch (e) {
        console.error("useBestCertificate error:", e);
        setLoading(false);
      }
    });

    return () => unsub();

    // ✅ trainingIds (string stable) au lieu de trainings (tableau instable)
  }, [userId, trainingIds]);

  return { status, bestFormation, loading };
}
