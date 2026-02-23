import { db } from "@/components/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch
} from "firebase/firestore";
import { useEffect, useState } from "react";

/**
 * Hook CRUD des leçons (Trainer only)
 * Chemin :
 * formations/{formationId}/modules/{moduleId}/lessons
 */
export function useLessons(formationId, moduleId) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ─────────────────────────────────────────
  // 🔹 Helpers Firestore Path
  // ─────────────────────────────────────────

  const lessonsCollection =
    formationId && moduleId
      ? collection(
          db,
          "formations",
          formationId,
          "modules",
          moduleId,
          "lessons",
        )
      : null;

  const lessonDoc = (lessonId) =>
    doc(
      db,
      "formations",
      formationId,
      "modules",
      moduleId,
      "lessons",
      lessonId,
    );

  // ─────────────────────────────────────────
  // 🔹 READ (Realtime)
  // ─────────────────────────────────────────

  useEffect(() => {
    if (!lessonsCollection) {
      setLessons([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(lessonsCollection, orderBy("order", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLessons(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [formationId, moduleId]);

  // ─────────────────────────────────────────
  // 🔹 CREATE
  // ─────────────────────────────────────────

  const addLesson = async ({ title, type, content, duration }) => {
    if (!title?.trim()) return;

    try {
      setActionLoading(true);

      await addDoc(lessonsCollection, {
        title: title.trim(),
        type: type || "text",
        content: content || "",
        duration: duration || null,
        order: lessons.length + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🔹 UPDATE
  // ─────────────────────────────────────────

  const updateLesson = async (lessonId, data) => {
    if (!lessonId) return;

    try {
      setActionLoading(true);

      await updateDoc(lessonDoc(lessonId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🔹 DELETE + Réindexation
  // ─────────────────────────────────────────

  const deleteLesson = async (lessonId) => {
    if (!lessonId) return;

    try {
      setActionLoading(true);

      const batch = writeBatch(db);

      // Supprime la leçon
      batch.delete(lessonDoc(lessonId));

      // Réindexe les restantes
      const remaining = lessons.filter((l) => l.id !== lessonId);

      remaining.forEach((lesson, index) => {
        batch.update(lessonDoc(lesson.id), {
          order: index + 1,
        });
      });

      await batch.commit();
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🔹 REORDER
  // ─────────────────────────────────────────

  const reorderLessons = async (newOrder) => {
    try {
      setActionLoading(true);

      const batch = writeBatch(db);

      newOrder.forEach((lesson, index) => {
        batch.update(lessonDoc(lesson.id), {
          order: index + 1,
        });
      });

      await batch.commit();
    } finally {
      setActionLoading(false);
    }
  };

  return {
    lessons,
    loading,
    actionLoading,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
  };
}
