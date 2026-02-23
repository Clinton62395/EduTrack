import { db } from "@/components/lib/firebase";
import {
    addDoc,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
import { useState } from "react";

/**
 * Hook de mutation des leçons.
 * Responsabilité unique : COMMANDS (écriture).
 */
export function useLessonsMutation(formationId, moduleId) {
  const [actionLoading, setActionLoading] = useState(false);

  const lessonsPath = () =>
    collection(db, "formations", formationId, "modules", moduleId, "lessons");

  const lessonDocPath = (lessonId) =>
    doc(
      db,
      "formations",
      formationId,
      "modules",
      moduleId,
      "lessons",
      lessonId,
    );

  // ➕ Ajouter
  const addLesson = async (lessonData) => {
    if (!lessonData.title?.trim()) {
      throw new Error("Le titre est requis");
    }

    try {
      setActionLoading(true);

      await addDoc(lessonsPath(), {
        title: lessonData.title.trim(),
        type: lessonData.type || "text",
        content: lessonData.content || "",
        duration: lessonData.duration || null,
        order: lessonData.order ?? 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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

      await updateDoc(lessonDocPath(lessonId), {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 🗑 Supprimer + réindexer
  const deleteLesson = async (lessonId, lessons) => {
    try {
      setActionLoading(true);

      const batch = writeBatch(db);

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

      const batch = writeBatch(db);

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
