import { db } from "@/components/lib/firebase"; // Instance firestore() native
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";

/**
 * Hook de mutation des leçons - Migration Native.
 * Responsabilité unique : COMMANDS (écriture).
 */
export function useLessonsMutation(formationId, moduleId) {
  const [actionLoading, setActionLoading] = useState(false);

  // 🔹 Helper centralisé pour les références (Sécurisé)
  const getLessonRef = (lessonId = null) => {
    if (!formationId || !moduleId)
      throw new Error("Missing IDs for Lesson Path");

    const base = db
      .collection("formations")
      .doc(formationId)
      .collection("modules")
      .doc(moduleId)
      .collection("lessons");

    return lessonId ? base.doc(lessonId) : base;
  };

  // ➕ Ajouter
  const addLesson = async (lessonData) => {
    if (!lessonData.title?.trim()) throw new Error("Le titre est requis");

    try {
      setActionLoading(true);

      await getLessonRef().add({
        title: lessonData.title.trim(),
        type: lessonData.type || "text",
        content: lessonData.content || "",
        duration: lessonData.duration || null,
        order: lessonData.order ?? 1,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ✏️ Modifier
  const updateLesson = async (lessonId, updatedData) => {
    if (!lessonId) return;

    try {
      setActionLoading(true);

      await getLessonRef(lessonId).update({
        ...updatedData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 🗑 Supprimer + réindexer (Batch Natif)
  const deleteLesson = async (lessonId, currentLessons) => {
    if (!lessonId) return;

    try {
      setActionLoading(true);

      // ✅ Utilisation du batch natif
      const batch = firestore().batch();

      // Suppression
      batch.delete(getLessonRef(lessonId));

      // Réindexation atomique
      const remaining = currentLessons.filter((l) => l.id !== lessonId);
      remaining.forEach((lesson, index) => {
        batch.update(getLessonRef(lesson.id), { order: index + 1 });
      });

      await batch.commit();
    } finally {
      setActionLoading(false);
    }
  };

  // 🔄 Réordonner (Batch Natif)
  const reorderLessons = async (newOrder) => {
    try {
      setActionLoading(true);
      const batch = firestore().batch();

      newOrder.forEach((lesson, index) => {
        batch.update(getLessonRef(lesson.id), { order: index + 1 });
      });

      await batch.commit();
    } finally {
      setActionLoading(false);
    }
  };

  return {
    actionLoading,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
  };
}
