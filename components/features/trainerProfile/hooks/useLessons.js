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
} from "firebase/firestore";
import { useEffect, useState } from "react";

/**
 * Hook de gestion des leçons d'un module.
 * Chemin Firestore : formations/{formationId}/modules/{moduleId}/lessons
 *
 * @param {string} formationId - ID de la formation parente
 * @param {string} moduleId - ID du module parent
 */
export function useLessons(formationId, moduleId) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ─────────────────────────────────────────
  // 🔔 SNACK (feedback utilisateur)
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
  // 🛤️ CHEMIN FIRESTORE (réutilisable)
  // ─────────────────────────────────────────
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

  // ─────────────────────────────────────────
  // 📡 ÉCOUTE TEMPS RÉEL
  // ─────────────────────────────────────────
  useEffect(() => {
    // Si les IDs ne sont pas encore disponibles, on attend
    if (!formationId || !moduleId) {
      setLessons([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // On écoute les leçons triées par leur champ `order`
    const q = query(lessonsPath(), orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLessons(data);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur chargement leçons:", error);
        showSnack("Erreur lors du chargement des leçons", "error");
        setLoading(false);
      },
    );

    // Nettoyage du listener au démontage
    return () => unsubscribe();
  }, [formationId, moduleId]);

  // ─────────────────────────────────────────
  // ➕ CRÉER UNE LEÇON
  // ─────────────────────────────────────────
  /**
   * @param {Object} lessonData
   * @param {string} lessonData.title - Titre de la leçon
   * @param {"text"|"video"|"pdf"|"quiz"} lessonData.type - Type de contenu
   * @param {string} lessonData.content - URL ou texte selon le type
   * @param {number} [lessonData.duration] - Durée estimée en minutes
   */
  const addLesson = async (lessonData) => {
    if (!lessonData.title?.trim()) {
      showSnack("Le titre est requis", "error");
      return;
    }

    try {
      setActionLoading(true);

      await addDoc(lessonsPath(), {
        title: lessonData.title.trim(),
        type: lessonData.type || "text",
        content: lessonData.content || "",
        duration: lessonData.duration || null,
        // L'ordre = position à la fin de la liste actuelle
        order: lessons.length + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Pas de setLessons manuel — onSnapshot gère la mise à jour
      showSnack("Leçon ajoutée avec succès", "success");
    } catch (error) {
      console.error("Erreur ajout leçon:", error);
      showSnack("Impossible d'ajouter la leçon", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // ✏️ MODIFIER UNE LEÇON
  // ─────────────────────────────────────────
  const updateLesson = async (lessonId, updatedData) => {
    if (!lessonId) return;

    try {
      setActionLoading(true);

      await updateDoc(lessonDocPath(lessonId), {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });

      showSnack("Leçon modifiée", "success");
    } catch (error) {
      console.error("Erreur modification leçon:", error);
      showSnack("Impossible de modifier la leçon", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🗑️ SUPPRIMER UNE LEÇON + réindexation
  // ─────────────────────────────────────────
  const deleteLesson = async (lessonId) => {
    try {
      setActionLoading(true);

      const batch = writeBatch(db);

      // Suppression de la leçon ciblée
      batch.delete(lessonDocPath(lessonId));

      // Réindexation des leçons restantes pour garder un ordre continu
      const remaining = lessons.filter((l) => l.id !== lessonId);
      remaining.forEach((lesson, index) => {
        batch.update(lessonDocPath(lesson.id), { order: index + 1 });
      });

      await batch.commit();

      showSnack("Leçon supprimée", "success");
    } catch (error) {
      console.error("Erreur suppression leçon:", error);
      showSnack("Impossible de supprimer la leçon", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🔄 RÉORDONNER LES LEÇONS
  // ─────────────────────────────────────────
  /**
   * @param {Array} newOrder - Tableau de leçons dans le nouvel ordre souhaité
   */
  const reorderLessons = async (newOrder) => {
    try {
      setActionLoading(true);

      const batch = writeBatch(db);

      newOrder.forEach((lesson, index) => {
        batch.update(lessonDocPath(lesson.id), { order: index + 1 });
      });

      await batch.commit();

      showSnack("Ordre mis à jour", "success");
    } catch (error) {
      console.error("Erreur réorganisation:", error);
      showSnack("Impossible de réorganiser", "error");
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

    snack,
    dismissSnack,
    showSnack,
  };
}
