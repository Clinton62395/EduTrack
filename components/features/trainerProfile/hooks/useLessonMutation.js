import { db } from "@/components/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "@react-native-firebase/firestore";
import { useState } from "react";

export function useLessonsMutation(formationId, moduleId) {
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ Helpers centralisés
  const lessonsCol = () => {
    if (!formationId || !moduleId)
      throw new Error("Missing IDs for Lesson Path");
    return collection(
      db,
      "formations",
      formationId,
      "modules",
      moduleId,
      "lessons",
    );
  };

  const lessonDoc = (lessonId) => {
    if (!formationId || !moduleId)
      throw new Error("Missing IDs for Lesson Path");
    return doc(
      db,
      "formations",
      formationId,
      "modules",
      moduleId,
      "lessons",
      lessonId,
    );
  };

  // ➕ Ajouter
  const addLesson = async (lessonData) => {
    if (!lessonData.title?.trim()) throw new Error("Le titre est requis");
    try {
      setActionLoading(true);
      await addDoc(lessonsCol(), {
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
      await updateDoc(lessonDoc(lessonId), {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 🗑 Supprimer + réindexer (Batch)
  const deleteLesson = async (lessonId, currentLessons) => {
    if (!lessonId) return;
    try {
      setActionLoading(true);
      const batch = writeBatch(db);

      batch.delete(lessonDoc(lessonId));

      const remaining = currentLessons.filter((l) => l.id !== lessonId);
      remaining.forEach((lesson, index) => {
        batch.update(lessonDoc(lesson.id), { order: index + 1 });
      });

      await batch.commit();
    } finally {
      setActionLoading(false);
    }
  };

  // 🔄 Réordonner (Batch)
  const reorderLessons = async (newOrder) => {
    try {
      setActionLoading(true);
      const batch = writeBatch(db);

      newOrder.forEach((lesson, index) => {
        batch.update(lessonDoc(lesson.id), { order: index + 1 });
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
