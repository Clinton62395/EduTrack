import { db } from "@/components/lib/firebase"; // Instance firestore() native
import firestore from "@react-native-firebase/firestore"; // Pour les utilitaires statiques
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
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
 * Hook CRUD des leçons - Migration Native
 */
export function useLessons(formationId, moduleId) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);

  // 🔹 Référence de base (Native)
  const getBaseRef = () => {
    return db
      .collection("formations")
      .doc(formationId)
      .collection("modules")
      .doc(moduleId)
      .collection("lessons");
  };

  // ─────────────────────────────────────────
  // 🔹 READ (Realtime)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!formationId || !moduleId) {
      setLessons([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // .onSnapshot natif
    const unsubscribe = getBaseRef()
      .orderBy("order", "asc")
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setLessons(data);
          setLoading(false);
        },
        (error) => {
          console.error("Erreur native leçons:", error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [formationId, moduleId]);

  // ─────────────────────────────────────────
  // 📂 PICKER + UPLOAD PDF
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
  // 🔹 CREATE (Native syntax)
  // ─────────────────────────────────────────
  const addLesson = async ({ title, type, content, duration }) => {
    if (!title?.trim() || !formationId || !moduleId) return;

    try {
      setActionLoading(true);

      await getBaseRef().add({
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
      await getBaseRef()
        .doc(lessonId)
        .update({
          ...data,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🔹 DELETE + Réindexation (Native Batch)
  // ─────────────────────────────────────────
  const deleteLesson = async (lessonId) => {
    if (!lessonId) return;

    try {
      setActionLoading(true);
      const batch = firestore().batch(); // ✅ Batch natif
      const baseRef = getBaseRef();

      batch.delete(baseRef.doc(lessonId));

      const remaining = lessons.filter((l) => l.id !== lessonId);
      remaining.forEach((lesson, index) => {
        batch.update(baseRef.doc(lesson.id), { order: index + 1 });
      });

      await batch.commit();
    } catch (error) {
      console.error("Delete Lesson Error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🔹 REORDER (Native Batch)
  // ─────────────────────────────────────────
  const reorderLessons = async (newOrder) => {
    try {
      setActionLoading(true);
      const batch = firestore().batch();
      const baseRef = getBaseRef();

      newOrder.forEach((lesson, index) => {
        batch.update(baseRef.doc(lesson.id), { order: index + 1 });
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
    uploadingPDF,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    pickAndUploadPDF,
  };
}
