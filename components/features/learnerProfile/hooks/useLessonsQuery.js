import { db } from "@/components/lib/firebase";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";
import { useCallback, useEffect, useState } from "react";

export function useLessonQuery({
  formationId,
  moduleId,
  lessonId,
  userId,
  isLearnerMode,
}) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  // ─────────────────────────────────────────
  // 📘 Charger la leçon (Realtime)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!formationId || !moduleId || !lessonId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const lessonRef = doc(
      db,
      "formations",
      formationId,
      "modules",
      moduleId,
      "lessons",
      lessonId,
    );

    const unsubscribe = onSnapshot(
      lessonRef,
      (snap) => {
        setLesson(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur leçon:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [formationId, moduleId, lessonId]);

  // ─────────────────────────────────────────
  // ✅ Vérifier si complété (ID prédictif)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!isLearnerMode || !userId || !lessonId) {
      setIsCompleted(false);
      return;
    }

    // ID prédictif → 1 lecture directe au lieu d'un .where()
    const progressRef = doc(db, "userProgress", `${userId}_${lessonId}`);

    const unsubscribe = onSnapshot(
      progressRef,
      (snap) => setIsCompleted(snap.exists()),
      (error) => console.error("Erreur snapshot progression:", error),
    );

    return () => unsubscribe();
  }, [isLearnerMode, userId, lessonId]);

  // ─────────────────────────────────────────
  // 🏆 Marquer comme terminé (Idempotent)
  // ─────────────────────────────────────────
  const completeLesson = useCallback(async () => {
    if (isCompleted || !userId || !lessonId) return;

    try {
      setCompleting(true);
      await setDoc(doc(db, "userProgress", `${userId}_${lessonId}`), {
        userId,
        trainingId: formationId,
        moduleId,
        lessonId,
        completedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Erreur completion:", error);
      return { success: false, error };
    } finally {
      setCompleting(false);
    }
  }, [isCompleted, userId, formationId, moduleId, lessonId]);

  return { lesson, loading, isCompleted, completing, completeLesson };
}
