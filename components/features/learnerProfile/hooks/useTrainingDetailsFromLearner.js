import { db } from "@/components/lib/firebase"; // Instance firestore() native
import { useEffect, useMemo, useState } from "react";

/**
 * Hook de détail d'une formation côté apprenant.
 * Gère la formation, les modules et la progression globale.
 */
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

    // 1. Détails de la formation (Snapshot Natif)
    const unsubTraining = db
      .collection("formations")
      .doc(trainingId)
      .onSnapshot((snapshot) => {
        if (snapshot?.exists) {
          setFormation({ id: snapshot.id, ...snapshot.data() });
        }
      });

    // 2. Modules (Snapshot Natif - Trié par ordre)
    const unsubModules = db
      .collection("formations")
      .doc(trainingId)
      .collection("modules")
      .orderBy("order", "asc")
      .onSnapshot((snapshot) => {
        if (snapshot) {
          setModules(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
          );
        }
        setLoading(false);
      });

    // 3. Progression (Leçons complétées)
    // On utilise un index composite (userId + trainingId) sur Firestore
    const unsubProgress = db
      .collection("userProgress")
      .where("userId", "==", userId)
      .where("trainingId", "==", trainingId)
      .onSnapshot((snapshot) => {
        if (snapshot) {
          const ids = snapshot.docs.map((doc) => doc.data().lessonId);
          setCompletedLessonIds(ids);
        }
      });

    return () => {
      unsubTraining();
      unsubModules();
      unsubProgress();
    };
  }, [trainingId, userId]);

  // 📊 HELPERS DE PROGRESSION (Mémoïsés pour éviter les calculs à chaque re-render)

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

  // Score de progression globale de la formation
  const globalProgress = useMemo(() => {
    // Note: Cela nécessite que le total des leçons soit stocké dans l'objet formation
    // ou calculé via les modules.
    const totalLessons = formation?.totalLessons || 0;
    if (totalLessons === 0) return 0;
    return Math.round((completedLessonIds.length / totalLessons) * 100);
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
