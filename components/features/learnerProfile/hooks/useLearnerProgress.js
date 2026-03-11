import { db } from "@/components/lib/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export function useLearnerProgress(userId, trainingId) {
  const [modules, setModules] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [totalLessonsCount, setTotalLessonsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !trainingId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // ─────────────────────────────────────────
    // 1. Structure formation (modules + leçons incluses)
    // ─────────────────────────────────────────
    const fetchStructure = async () => {
      try {
        const modulesSnap = await getDocs(
          collection(db, "formations", trainingId, "modules"),
        );

        const modulesData = modulesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // ✅ On charge les leçons de chaque module ET on les stocke dedans
        const modulesWithLessons = await Promise.all(
          modulesData.map(async (m) => {
            const lessonsSnap = await getDocs(
              collection(
                db,
                "formations",
                trainingId,
                "modules",
                m.id,
                "lessons",
              ),
            );
            const lessons = lessonsSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));
            return { ...m, lessons };
          }),
        );

        const total = modulesWithLessons.reduce(
          (acc, m) => acc + m.lessons.length,
          0,
        );

        if (isMounted) {
          setModules(modulesWithLessons);
          setTotalLessonsCount(total);
        }
      } catch (error) {
        console.error("Erreur structure formation:", error);
      }
    };

    fetchStructure();

    // ─────────────────────────────────────────
    // 2. Progression temps réel
    // ─────────────────────────────────────────
    const unsub = onSnapshot(
      query(
        collection(db, "userProgress"),
        where("userId", "==", userId),
        where("trainingId", "==", trainingId),
      ),
      (snapshot) => {
        const ids = snapshot?.docs.map((d) => d.data().lessonId) || [];
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
      unsub();
    };
  }, [userId, trainingId]);

  // ─────────────────────────────────────────
  // 📊 CALCULS MÉMOÏSÉS
  // ─────────────────────────────────────────
  const globalProgressPercentage = useMemo(() => {
    if (totalLessonsCount === 0) return 0;
    return Math.min(
      Math.round((completedLessonIds.length / totalLessonsCount) * 100),
      100,
    );
  }, [completedLessonIds.length, totalLessonsCount]);

  // ✅ Signature corrigée : prend directement les leçons du module
  const getModuleProgress = (lessons = []) => {
    if (lessons.length === 0) return { completed: 0, total: 0, percentage: 0 };
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
