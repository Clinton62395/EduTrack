import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
// firestore via db; FieldValue via firestore.FieldValue

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
      ? db
          .collection("formations")
          .doc(formationId)
          .collection("modules")
          .doc(moduleId)
          .collection("lessons")
      : null;

  const lessonDoc = (lessonId) =>
    db
      .collection("formations")
      .doc(formationId)
      .collection("modules")
      .doc(moduleId)
      .collection("lessons")
      .doc(lessonId);

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
    const q = lessonsCollection.orderBy("order", "asc");

    const unsubscribe = q.onSnapshot((snapshot) => {
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

      await lessonsCollection.add({
        title: title.trim(),
        type: type || "text",
        content: content || "",
        duration: duration || null,
        order: lessons.length + 1,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
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

      await lessonDoc(lessonId).update({
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
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
      const batch = db.batch();

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
      const batch = db.batch();

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
