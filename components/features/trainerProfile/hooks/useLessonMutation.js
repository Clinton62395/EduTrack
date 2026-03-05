import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
// firestore operations via db; FieldValue via firestore.FieldValue

/**
 * Hook de mutation des leçons.
 * Responsabilité unique : COMMANDS (écriture).
 */
export function useLessonsMutation(formationId, moduleId) {
  const [actionLoading, setActionLoading] = useState(false);

  const lessonsPath = () =>
    db
      .collection("formations")
      .doc(formationId)
      .collection("modules")
      .doc(moduleId)
      .collection("lessons");

  const lessonDocPath = (lessonId) =>
    db
      .collection("formations")
      .doc(formationId)
      .collection("modules")
      .doc(moduleId)
      .collection("lessons")
      .doc(lessonId);

  // ➕ Ajouter
  const addLesson = async (lessonData) => {
    if (!lessonData.title?.trim()) {
      throw new Error("Le titre est requis");
    }

    try {
      setActionLoading(true);

      await lessonsPath().add({
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

      await lessonDocPath(lessonId).update({
        ...updatedData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 🗑 Supprimer + réindexer
  const deleteLesson = async (lessonId, lessons) => {
    try {
      setActionLoading(true);

      const batch = db.batch();

      batch.delete(lessonDocPath(lessonId));

      // Réindexation locale
      const remaining = lessons.filter((l) => l.id !== lessonId);

      remaining.forEach((lesson, index) => {
        batch.update(lessonDocPath(lesson.id), { order: index + 1 });
      });

      await batch.commit();
    } finally {
      setActionLoading(false);
    }
  };

  // 🔄 Réordonner
  const reorderLessons = async (newOrder) => {
    try {
      setActionLoading(true);

      const batch = db.batch();

      newOrder.forEach((lesson, index) => {
        batch.update(lessonDocPath(lesson.id), { order: index + 1 });
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
