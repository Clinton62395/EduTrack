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
  writeBatch,
} from "@react-native-firebase/firestore";
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

export function useLessons(formationId, moduleId) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);

  // ✅ Helper collection ref
  const lessonsCol = () =>
    collection(db, "formations", formationId, "modules", moduleId, "lessons");

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

    const q = query(lessonsCol(), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLessons(data);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur leçons:", error);
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
  // 🔹 CREATE
  // ─────────────────────────────────────────
  const addLesson = async ({ title, type, content, duration }) => {
    if (!title?.trim() || !formationId || !moduleId) return;

    try {
      setActionLoading(true);
      await addDoc(lessonsCol(), {
        title: title.trim(),
        type: type || "text",
        content: content || "",
        duration: duration || null,
        order: lessons.length + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("addLesson error:", error);
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
      await updateDoc(
        doc(
          db,
          "formations",
          formationId,
          "modules",
          moduleId,
          "lessons",
          lessonId,
        ),
        { ...data, updatedAt: serverTimestamp() },
      );
    } catch (error) {
      console.error("updateLesson error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🔹 DELETE + Réindexation (Batch)
  // ─────────────────────────────────────────
  const deleteLesson = async (lessonId) => {
    if (!lessonId) return;

    try {
      setActionLoading(true);
      const batch = writeBatch(db);

      batch.delete(
        doc(
          db,
          "formations",
          formationId,
          "modules",
          moduleId,
          "lessons",
          lessonId,
        ),
      );

      const remaining = lessons.filter((l) => l.id !== lessonId);
      remaining.forEach((lesson, index) => {
        batch.update(
          doc(
            db,
            "formations",
            formationId,
            "modules",
            moduleId,
            "lessons",
            lesson.id,
          ),
          { order: index + 1 },
        );
      });

      await batch.commit();
    } catch (error) {
      console.error("deleteLesson error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🔹 REORDER (Batch)
  // ─────────────────────────────────────────
  const reorderLessons = async (newOrder) => {
    try {
      setActionLoading(true);
      const batch = writeBatch(db);

      newOrder.forEach((lesson, index) => {
        batch.update(
          doc(
            db,
            "formations",
            formationId,
            "modules",
            moduleId,
            "lessons",
            lesson.id,
          ),
          { order: index + 1 },
        );
      });

      await batch.commit();
    } catch (error) {
      console.error("reorderLessons error:", error);
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
