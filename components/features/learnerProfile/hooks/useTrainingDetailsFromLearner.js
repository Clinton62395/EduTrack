import { db } from "@/components/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "@react-native-firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export function useLearnerTrainingDetail(trainingId, userId) {
  const [formation, setFormation] = useState(null);
  const [modules, setModules] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trainingId || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Formation en temps réel
    const unsubTraining = onSnapshot(
      doc(db, "formations", trainingId),
      (snapshot) => {
        if (snapshot?.exists()) {
          setFormation({ id: snapshot.id, ...snapshot.data() });
        }
      },
    );

    // 2. Modules triés par ordre
    const unsubModules = onSnapshot(
      query(
        collection(db, "formations", trainingId, "modules"),
        orderBy("order", "asc"),
      ),
      (snapshot) => {
        setModules(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
    );

    // 3. Progression (leçons complétées)
    const unsubProgress = onSnapshot(
      query(
        collection(db, "userProgress"),
        where("userId", "==", userId),
        where("trainingId", "==", trainingId),
      ),
      (snapshot) => {
        setCompletedLessonIds(snapshot.docs.map((d) => d.data().lessonId));
      },
    );

    return () => {
      unsubTraining();
      unsubModules();
      unsubProgress();
    };
  }, [trainingId, userId]);

  // ─────────────────────────────────────────
  // 📊 HELPERS MÉMOÏSÉS
  // ─────────────────────────────────────────
  const isLessonCompleted = useMemo(
    () => (lessonId) => completedLessonIds.includes(lessonId),
    [completedLessonIds],
  );

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

  const globalProgress = useMemo(() => {
    const totalLessons = formation?.totalLessons || 0;
    if (totalLessons === 0) return 0;
    return Math.min(
      Math.round((completedLessonIds.length / totalLessons) * 100),
      100,
    );
  }, [completedLessonIds, formation?.totalLessons]);

  return {
    formation,
    modules,
    completedLessonIds,
    isLessonCompleted,
    getModuleProgress,
    globalProgress,
    loading,
  };
}
