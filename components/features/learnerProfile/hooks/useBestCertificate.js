import { db } from "@/components/lib/firebase"; // Instance firestore() native
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Version Native optimisée : Calcule la meilleure éligibilité aux certificats.
 * Gère le passage de "Verrouillé" -> "Éligible" -> "Obtenu".
 */
export function useBestCertificate(userId, trainings) {
  const [status, setStatus] = useState("locked");
  const [bestFormation, setBestFormation] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Stabilisation des IDs pour éviter les boucles infinies
  const trainingIds = useMemo(
    () => trainings?.map((t) => t.id).join(",") ?? "",
    [trainings],
  );

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

    // 📡 Écoute des certificats déjà générés (Temps réel)
    const unsub = db
      .collection("certificates")
      .where("userId", "==", userId)
      .onSnapshot(async (certSnap) => {
        try {
          const currentTrainings = trainingsRef.current ?? [];
          if (currentTrainings.length === 0) {
            setLoading(false);
            return;
          }

          const certTrainingIds = certSnap.docs.map((d) => d.data().trainingId);

          // 🏆 PRIORITÉ 1 : Déjà obtenu (On vérifie si l'ID est dans certificates)
          for (const training of currentTrainings) {
            if (certTrainingIds.includes(training.id)) {
              setStatus("obtained");
              setBestFormation(training);
              setLoading(false);
              return;
            }
          }

          // ⚡ PRIORITÉ 2 : Éligibilité (Calcul de masse)
          // On récupère tout le progrès de l'utilisateur d'un coup
          const progressSnap = await db
            .collection("userProgress")
            .where("userId", "==", userId)
            .get();

          const completedLessonIds = progressSnap.docs.map(
            (d) => d.data().lessonId,
          );

          // Vérification de chaque formation en parallèle
          const eligibilityResults = await Promise.all(
            currentTrainings.map(async (training) => {
              // Récupération des modules
              const modulesSnap = await db
                .collection("formations")
                .doc(training.id)
                .collection("modules")
                .get();

              if (modulesSnap.empty) return { training, isEligible: false };

              // Récupération de toutes les leçons de tous les modules en parallèle
              const lessonQueries = modulesSnap.docs.map((mod) =>
                db
                  .collection("formations")
                  .doc(training.id)
                  .collection("modules")
                  .doc(mod.id)
                  .collection("lessons")
                  .get(),
              );

              const lessonsSnaps = await Promise.all(lessonQueries);

              let allDone = true;
              for (const snap of lessonsSnaps) {
                if (snap.empty) continue;
                // .id est accessible directement sur le doc natif
                const ids = snap.docs.map((d) => d.id);
                if (!ids.every((id) => completedLessonIds.includes(id))) {
                  allDone = false;
                  break;
                }
              }
              return { training, isEligible: allDone };
            }),
          );

          const eligibleFormation = eligibilityResults.find(
            (r) => r.isEligible,
          );

          if (eligibleFormation) {
            setStatus("eligible");
            setBestFormation(eligibleFormation.training);
          } else {
            setStatus("locked");
            setBestFormation(currentTrainings[0] ?? null);
          }

          setLoading(false);
        } catch (e) {
          console.error("useBestCertificate error:", e);
          setLoading(false);
        }
      });

    return () => unsub();
  }, [userId, trainingIds]);

  return { status, bestFormation, loading };
}
