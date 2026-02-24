import { db } from "@/components/lib/firebase";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const CLOUDINARY_CLOUD_NAME = "dhpbglioz";
const CLOUDINARY_UPLOAD_PRESET = "edutrack_unsigned";

// ─────────────────────────────────────────
// 📤 UPLOAD PDF VERS CLOUDINARY
// ─────────────────────────────────────────
async function uploadPDFToCloudinary(uri, name) {
  const formData = new FormData();
  formData.append("file", { uri, type: "application/pdf", name });
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "Edutrack/Lessons/PDFs");

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data.secure_url;
}

/**
 * Hook CRUD des leçons (Trainer only)
 * Gère aussi l'upload PDF vers Cloudinary
 * Chemin : formations/{formationId}/modules/{moduleId}/lessons
 */
export function useLessons(formationId, moduleId) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);

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
      setLessons(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [formationId, moduleId]);

  // ─────────────────────────────────────────
  // 📂 PICKER + UPLOAD PDF
  // Appelé depuis le modal quand type === "pdf"
  // Retourne { url, name } ou null si annulé
  // ─────────────────────────────────────────
  const pickAndUploadPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return null;

      const file = result.assets[0];
      setUploadingPDF(true);

      const url = await uploadPDFToCloudinary(file.uri, file.name);
      return { url, name: file.name };
    } catch (error) {
      console.error("Erreur upload PDF:", error);
      return null;
    } finally {
      setUploadingPDF(false);
    }
  };

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

      batch.delete(lessonDoc(lessonId));

      const remaining = lessons.filter((l) => l.id !== lessonId);
      remaining.forEach((lesson, index) => {
        batch.update(lessonDoc(lesson.id), { order: index + 1 });
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
        batch.update(lessonDoc(lesson.id), { order: index + 1 });
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
    uploadingPDF, // ← pour afficher le loader dans le modal
    addLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    pickAndUploadPDF, // ← appelé depuis le modal
  };
}
