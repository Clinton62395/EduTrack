import { db } from "@/components/lib/firebase";
import { useEffect, useState } from "react";
// firestore via db methods

/**
 * Hook de détail d'une formation côté apprenant.
 * Migré vers la collection `userProgress` (une leçon = un doc).
 *
 * @param {string} trainingId - ID de la formation
 * @param {string} userId - ID de l'apprenant
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

    // ─────────────────────────────────────────
    // 1. Écouter les détails de la formation
    // ─────────────────────────────────────────
    const trainingRef = db.collection("formations").doc(trainingId);
    const unsubTraining = trainingRef.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        setFormation({ id: snapshot.id, ...snapshot.data() });
      }
    });

    // ─────────────────────────────────────────
    // 2. Écouter les modules (triés par ordre)
    // ─────────────────────────────────────────
    const modulesQuery = db
      .collection("formations")
      .doc(trainingId)
      .collection("modules")
      .orderBy("order", "asc");

    const unsubModules = modulesQuery.onSnapshot((snapshot) => {
      setModules(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // ─────────────────────────────────────────
    // 3. Écouter les leçons complétées
    //    depuis la collection userProgress
    // ─────────────────────────────────────────
    const progressQuery = db
      .collection("userProgress")
      .where("userId", "==", userId)
      .where("trainingId", "==", trainingId);

    const unsubProgress = progressQuery.onSnapshot((snapshot) => {
      // On extrait les lessonIds complétés
      const ids = snapshot.docs.map((doc) => doc.data().lessonId);
      setCompletedLessonIds(ids);
    });

    return () => {
      unsubTraining();
      unsubModules();
      unsubProgress();
    };
  }, [trainingId, userId]);

  // ─────────────────────────────────────────
  // 📊 HELPERS DE PROGRESSION
  // ─────────────────────────────────────────

  /**
   * Vérifie si une leçon est complétée
   */
  const isLessonCompleted = (lessonId) => completedLessonIds.includes(lessonId);

  /**
   * Nombre de leçons complétées pour ce module
   * @param {Array} lessons - leçons du module
   */
  const getModuleProgress = (lessons = []) => {
    const completed = lessons.filter((l) =>
      completedLessonIds.includes(l.id),
    ).length;
    return {
      completed,
      total: lessons.length,
      percentage:
        lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0,
    };
  };

  return {
    formation,
    modules,
    completedLessonIds,
    isLessonCompleted,
    getModuleProgress,
    loading,
  };
}
