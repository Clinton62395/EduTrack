import { useLessons } from "@/components/features/trainerProfile/hooks/useLessons";
import { useRouter } from "expo-router";
import { useState } from "react";

export function useModuleDetail(formationId, moduleId, moduleTitle) {
  const router = useRouter();

  // 🔹 Data layer
  const {
    lessons,
    loading,
    actionLoading,
    uploadingPDF,
    addLesson,
    updateLesson,
    deleteLesson,
    pickAndUploadPDF,
  } = useLessons(formationId, moduleId);

  // ─────────────────────────────────────────
  // 🔔 Snack
  // ─────────────────────────────────────────
  const [snack, setSnack] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showSnack = (message, type = "success") =>
    setSnack({ visible: true, message, type });

  const dismissSnack = () => setSnack((prev) => ({ ...prev, visible: false }));

  // ─────────────────────────────────────────
  // 🪟 Modal state
  // ─────────────────────────────────────────
  const [modal, setModal] = useState({
    visible: false,
    selectedLesson: null,
  });

  const openAddModal = () => setModal({ visible: true, selectedLesson: null });
  const openEditModal = (lesson) =>
    setModal({ visible: true, selectedLesson: lesson });
  const closeModal = () => setModal({ visible: false, selectedLesson: null });

  // ─────────────────────────────────────────
  // ➕ / ✏️ Submit
  // ─────────────────────────────────────────
  const handleSubmit = async (data) => {
    try {
      if (modal.selectedLesson) {
        await updateLesson(modal.selectedLesson.id, data);
        showSnack("Leçon modifiée avec succès");
      } else {
        await addLesson(data);
        showSnack("Leçon ajoutée avec succès");
      }
      closeModal();
    } catch {
      showSnack("Une erreur est survenue", "error");
    }
  };

  // ─────────────────────────────────────────
  // 🗑️ Delete
  // ─────────────────────────────────────────
  const handleDelete = async (lessonId) => {
    try {
      await deleteLesson(lessonId);
      showSnack("Leçon supprimée");
    } catch {
      showSnack("Impossible de supprimer", "error");
    }
  };

  // ─────────────────────────────────────────
  // ❓ Quiz
  // ─────────────────────────────────────────
  const goToQuiz = () => {
    if (lessons.length === 0) {
      showSnack("Ajoutez au moins une leçon avant de créer un quiz", "warning");
      return;
    }
    router.push({
      pathname: "/(trainer-tabs)/trainings/[module]/lessons/quiz",
      params: { formationId, moduleId, moduleTitle },
    });
  };

  // ─────────────────────────────────────────
  // 📚 Navigation leçon
  // ─────────────────────────────────────────
  const goToLessonDetail = (lessonId) => {
    router.push({
      pathname: "/(trainer-tabs)/trainings/[module]/lessons/[lessonId]",
      params: { lessonId, formationId, moduleId, isLearner: "false" },
    });
  };

  return {
    lessons,
    loading,
    actionLoading,
    uploadingPDF, // ✅ exposé
    pickAndUploadPDF, // ✅ exposé
    modal,
    snack,
    handlers: {
      openAddModal,
      openEditModal,
      closeModal,
      handleSubmit,
      handleDelete,
      goToQuiz,
      goToLessonDetail,
      dismissSnack,
    },
  };
}
