import { db } from "@/components/lib/firebase"; // Instance firestore() native
import firestore from "@react-native-firebase/firestore";
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
  // 📘 Charger la leçon (Realtime Native)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!formationId || !moduleId || !lessonId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const lessonRef = db
      .collection("formations")
      .doc(formationId)
      .collection("modules")
      .doc(moduleId)
      .collection("lessons")
      .doc(lessonId);

    const unsubscribe = lessonRef.onSnapshot(
      (snap) => {
        if (snap.exists) {
          setLesson({ id: snap.id, ...snap.data() });
        } else {
          setLesson(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erreur native leçon:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [formationId, moduleId, lessonId]);

  // ─────────────────────────────────────────
  // ✅ Vérifier si complété (Optimisé)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!isLearnerMode || !userId || !lessonId) {
      setIsCompleted(false);
      return;
    }

    // On pointe directement sur l'ID prévisible au lieu d'un .where()
    // C'est plus performant et coûte moins de lectures Firestore
    const progressId = `${userId}_${lessonId}`;
    const progressRef = db.collection("userProgress").doc(progressId);

    const unsubscribe = progressRef.onSnapshot(
      (snap) => {
        setIsCompleted(snap.exists);
      },
      (error) => {
        console.error("Erreur snapshot progression:", error);
      },
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

      // ✅ Utilisation d'un ID unique pour éviter les doublons
      const progressId = `${userId}_${lessonId}`;

      await db.collection("userProgress").doc(progressId).set({
        userId,
        trainingId: formationId,
        moduleId,
        lessonId,
        completedAt: firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("Erreur native completion:", error);
      return { success: false, error };
    } finally {
      setCompleting(false);
    }
  }, [isCompleted, userId, formationId, moduleId, lessonId]);

  return {
    lesson,
    loading,
    isCompleted,
    completing,
    completeLesson,
  };
}
