// hooks/useLessonQuery.ts

import { db } from "@/components/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
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
  // 📘 Charger la leçon
  // ─────────────────────────────────────────
  useEffect(() => {
    // 🔒 Sécurité : paramètres non prêts
    if (!formationId || !moduleId || !lessonId) {
      
      setLoading(false); // IMPORTANT
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

    const q = query(
      collection(db, "userProgress"),
      where("userId", "==", userId),
      where("lessonId", "==", lessonId),
    );

    const unsubscribe = onSnapshot(
      q,
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

      await addDoc(collection(db, "userProgress"), {
        userId,
        trainingId: formationId,
        moduleId,
        lessonId,
        completedAt: serverTimestamp(),
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
