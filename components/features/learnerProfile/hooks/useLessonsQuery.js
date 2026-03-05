// hooks/useLessonQuery.ts

import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import { useCallback, useEffect, useState } from "react";
// firestore via db; FieldValue via firestore.FieldValue

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
  // 📘 Charger la leçon
  // ─────────────────────────────────────────
  useEffect(() => {
    // 🔒 Sécurité : paramètres non prêts
    if (!formationId || !moduleId || !lessonId) {
      setLoading(false); // IMPORTANT
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
        if (snap.exists()) {
          setLesson({ id: snap.id, ...snap.data() });
        } else {
          setLesson(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erreur snapshot leçon:", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [formationId, moduleId, lessonId]);

  // ─────────────────────────────────────────
  // ✅ Vérifier si complété
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!isLearnerMode || !userId || !lessonId) {
      setIsCompleted(false);
      return;
    }

    const q = db
      .collection("userProgress")
      .where("userId", "==", userId)
      .where("lessonId", "==", lessonId);

    const unsubscribe = q.onSnapshot(
      (snapshot) => {
        setIsCompleted(!snapshot.empty);
      },
      (error) => {
        console.error("Erreur progression:", error);
      },
    );

    return unsubscribe;
  }, [isLearnerMode, userId, lessonId]);

  // ─────────────────────────────────────────
  // 🏆 Marquer comme terminé
  // ─────────────────────────────────────────
  const completeLesson = useCallback(async () => {
    if (isCompleted || !userId) return;

    try {
      setCompleting(true);

      await db.collection("userProgress").add({
        userId,
        trainingId: formationId,
        moduleId,
        lessonId,
        completedAt: firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("Erreur completion leçon:", error);
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
