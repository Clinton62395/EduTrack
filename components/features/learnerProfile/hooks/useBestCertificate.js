import { db } from "@/components/lib/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";

export function useBestCertificate(userId, trainings) {
  const [status, setStatus] = useState("locked");
  const [bestFormation, setBestFormation] = useState(null);
  const [loading, setLoading] = useState(true);

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

    // 📡 Écoute temps réel des certificats déjà générés
    const unsub = onSnapshot(
      query(collection(db, "certificates"), where("userId", "==", userId)),
      async (certSnap) => {
        try {
          const currentTrainings = trainingsRef.current ?? [];
          if (currentTrainings.length === 0) {
            setLoading(false);
            return;
          }

          const certTrainingIds = certSnap.docs.map((d) => d.data().trainingId);

          // 🏆 PRIORITÉ 1 : Certificat déjà obtenu
          for (const training of currentTrainings) {
            if (certTrainingIds.includes(training.id)) {
              setStatus("obtained");
              setBestFormation(training);
              setLoading(false);
              return;
            }
          }

          // ⚡ PRIORITÉ 2 : Vérification éligibilité (leçons + quiz)
          const [progressSnap] = await Promise.all([
            getDocs(
              query(
                collection(db, "userProgress"),
                where("userId", "==", userId),
              ),
            ),
          ]);

          const completedLessonIds = progressSnap.docs.map(
            (d) => d.data().lessonId,
          );

          const eligibilityResults = await Promise.all(
            currentTrainings.map(async (training) => {
              const modulesSnap = await getDocs(
                collection(db, "formations", training.id, "modules"),
              );

              if (modulesSnap.empty) return { training, isEligible: false };

              // Récupère leçons + quiz en parallèle pour tous les modules
              const [lessonsSnaps, quizSnaps, quizResultsSnap] =
                await Promise.all([
                  Promise.all(
                    modulesSnap.docs.map((mod) =>
                      getDocs(
                        collection(
                          db,
                          "formations",
                          training.id,
                          "modules",
                          mod.id,
                          "lessons",
                        ),
                      ),
                    ),
                  ),
                  Promise.all(
                    modulesSnap.docs.map((mod) =>
                      getDocs(
                        collection(
                          db,
                          "formations",
                          training.id,
                          "modules",
                          mod.id,
                          "quiz",
                        ),
                      ),
                    ),
                  ),
                  getDocs(
                    query(
                      collection(db, "quizResults"),
                      where("userId", "==", userId),
                      where("trainingId", "==", training.id),
                      where("passed", "==", true),
                    ),
                  ),
                ]);

              const passedModuleIds = quizResultsSnap.docs.map(
                (d) => d.data().moduleId,
              );

              // Vérification leçons
              let allLessonsCompleted = true;
              for (const snap of lessonsSnaps) {
                if (snap.empty) continue;
                const ids = snap.docs.map((d) => d.id);
                if (!ids.every((id) => completedLessonIds.includes(id))) {
                  allLessonsCompleted = false;
                  break;
                }
              }

              // Vérification quiz
              let allQuizPassed = true;
              quizSnaps.forEach((snap, index) => {
                const moduleId = modulesSnap.docs[index].id;
                if (!snap.empty && !passedModuleIds.includes(moduleId)) {
                  allQuizPassed = false;
                }
              });

              return {
                training,
                isEligible: allLessonsCompleted && allQuizPassed,
              };
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
      },
    );

    return () => unsub();
  }, [userId, trainingIds]);

  return { status, bestFormation, loading };
}
