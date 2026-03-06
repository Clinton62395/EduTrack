import firestore from "@react-native-firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export function useLearnerProgress(userId, trainingId) {
  const [modules, setModules] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [totalLessonsCount, setTotalLessonsCount] = useState(0); // Crucial pour le % global
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !trainingId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // ─────────────────────────────────────────
    // 1. Charger les modules ET calculer le total des leçons
    // ─────────────────────────────────────────
    const fetchStructure = async () => {
      try {
        const modulesSnap = await firestore()
          .collection("formations")
          .doc(trainingId)
          .collection("modules")
          .get();

        const modulesData = modulesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // On va chercher le compte total des leçons pour le % global
        // Note: Idéalement, stocke 'totalLessons' dans le doc formation pour éviter ce fetch
        let total = 0;
        const lessonCounts = await Promise.all(
          modulesData.map((m) =>
            firestore()
              .collection("formations")
              .doc(trainingId)
              .collection("modules")
              .doc(m.id)
              .collection("lessons")
              .get(),
          ),
        );

        lessonCounts.forEach((snap) => (total += snap.size));

        if (isMounted) {
          setModules(modulesData);
          setTotalLessonsCount(total);
        }
      } catch (error) {
        console.error("Erreur structure formation:", error);
      }
    };

    fetchStructure();

    // ─────────────────────────────────────────
    // 2. Écoute temps réel de la progression
    // ─────────────────────────────────────────
    const unsubscribe = firestore()
      .collection("userProgress")
      .where("userId", "==", userId)
      .where("trainingId", "==", trainingId)
      .onSnapshot(
        (snapshot) => {
          const ids = snapshot?.docs.map((doc) => doc.data().lessonId) || [];
          setCompletedLessonIds(ids);
          setLoading(false);
        },
        (error) => {
          console.error("Erreur progression:", error);
          setLoading(false);
        },
      );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [userId, trainingId]);

  // ─────────────────────────────────────────
  // 📊 CALCULS (Mémoïsés pour la performance)
  // ─────────────────────────────────────────

  const globalProgressPercentage = useMemo(() => {
    if (totalLessonsCount === 0) return 0;
    const percent = Math.round(
      (completedLessonIds.length / totalLessonsCount) * 100,
    );
    return Math.min(percent, 100);
  }, [completedLessonIds.length, totalLessonsCount]);

  const getModuleProgress = (moduleId, lessons = []) => {
    if (lessons.length === 0) return { completed: 0, total: 0, percentage: 0 };

    // Si tes leçons ne sont pas passées en argument, il faudrait les filtrer depuis un état global
    const completed = lessons.filter((l) =>
      completedLessonIds.includes(l.id),
    ).length;

    return {
      completed,
      total: lessons.length,
      percentage: Math.round((completed / lessons.length) * 100),
    };
  };

  return {
    modules,
    completedLessonIds,
    globalProgressPercentage,
    getModuleProgress,
    loading,
    totalLessonsCount,
  };
}
