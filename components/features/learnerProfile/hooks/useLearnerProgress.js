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
 * Hook de suivi de progression d'un apprenant sur une formation.
 *
 * Structure Firestore utilisée :
 * userProgress/ ← collection
 *   { userId, trainingId, moduleId, lessonId, completedAt }
 *
 * @param {string} userId - ID de l'apprenant
 * @param {string} trainingId - ID de la formation
 */
export function useLearnerProgress(userId, trainingId) {
  const [modules, setModules] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !trainingId) {
      setLoading(false);
      return;
    }

    // ─────────────────────────────────────────
    // 1. Charger tous les modules de la formation
    //    (one-shot, les modules changent rarement)
    // ─────────────────────────────────────────
    const fetchModules = async () => {
      try {
        const snap = await getDocs(
          collection(db, "formations", trainingId, "modules"),
        );
        setModules(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Erreur chargement modules:", error);
      }
    };

    fetchModules();

    // ─────────────────────────────────────────
    // 2. Écouter en temps réel les leçons complétées
    //    par cet apprenant sur cette formation
    // ─────────────────────────────────────────
    const q = query(
      collection(db, "userProgress"),
      where("userId", "==", userId),
      where("trainingId", "==", trainingId),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // On extrait uniquement les lessonIds complétés
        const ids = snapshot.docs.map((doc) => doc.data().lessonId);
        setCompletedLessonIds(ids);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur écoute progression:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId, trainingId]);

  // ─────────────────────────────────────────
  // 📊 CALCULS DE PROGRESSION
  // ─────────────────────────────────────────

  /**
   * Vérifie si un module est complété.
   * Un module est considéré complété si toutes ses leçons
   * ont un doc dans userProgress.
   *
   * @param {string} moduleId
   * @param {Array} lessons - Leçons du module
   */
  const isModuleCompleted = (moduleId, lessons = []) => {
    if (lessons.length === 0) return false;
    return lessons.every((lesson) => completedLessonIds.includes(lesson.id));
  };

  /**
   * Nombre de leçons complétées pour un module donné.
   *
   * @param {Array} lessons - Leçons du module
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

  /**
   * Progression globale sur la formation.
   * Basée sur le nombre de leçons complétées / total des leçons.
   *
   * Note : ce calcul est approximatif si on n'a pas toutes les leçons
   * chargées. Pour un calcul exact, utilise getModuleProgress par module.
   */
  const globalProgressPercentage =
    completedLessonIds.length > 0
      ? Math.min(
          Math.round(
            (completedLessonIds.length /
              Math.max(completedLessonIds.length, 1)) *
              100,
          ),
          100,
        )
      : 0;

  return {
    modules,
    completedLessonIds,
    isModuleCompleted,
    getModuleProgress,
    globalProgressPercentage,
    loading,
  };
}
