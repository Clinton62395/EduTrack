import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

// ─────────────────────────────────────────
// 🧮 Calcule le statut dynamiquement
// à partir de startDate et endDate
// ─────────────────────────────────────────
function getStatus(training) {
  const now = new Date();
  const start = new Date(training.startDate);
  const end = new Date(training.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "planned";
  if (now < start) return "planned";
  if (now > end) return "completed";
  return "ongoing";
}

export function useTrainings() {
  const { user } = useAuth();

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // 🔔 Snackbar
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState("success");

  const showSnack = (message, type = "success") => {
    setSnackMessage(message);
    setSnackType(type);
    setSnackVisible(true);
  };

  const dismissSnack = () => setSnackVisible(false);

  // ─────────────────────────────────────────
  // 📡 ÉCOUTE FIRESTORE
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "formations"),
      where("trainerId", "==", user.uid),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => {
          const formation = {
            id: d.id,
            ...d.data(),
            coverImage: d.data().coverImage || null,
          };
          return {
            ...formation,
            status: getStatus(formation), // ← statut calculé dynamiquement
          };
        });
        setTrainings(data);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur chargement formations:", error);
        showSnack("Erreur lors du chargement des formations", "error");
        setLoading(false);
      },
    );

    return unsub;
  }, [user?.uid]);

  // ─────────────────────────────────────────
  // 🔍 FILTRAGE — mémoïsé pour la perf
  // ─────────────────────────────────────────
  const filteredTrainings = useMemo(() => {
    if (filter === "all") return trainings;
    return trainings.filter((t) => t.status === filter);
  }, [trainings, filter]);

  // ─────────────────────────────────────────
  // 📊 STATS PAR STATUT
  // ─────────────────────────────────────────
  const stats = useMemo(
    () => ({
      all: trainings.length,
      planned: trainings.filter((t) => t.status === "planned").length,
      ongoing: trainings.filter((t) => t.status === "ongoing").length,
      completed: trainings.filter((t) => t.status === "completed").length,
    }),
    [trainings],
  );

  // ─────────────────────────────────────────
  // ➕ CRÉER
  // ─────────────────────────────────────────
  const createTraining = async (trainingData) => {
    try {
      await addDoc(collection(db, "formations"), trainingData);
      showSnack("Formation créée avec succès", "success");
      return true;
    } catch (error) {
      console.error("Erreur création formation:", error);
      showSnack("Impossible de créer la formation", "error");
      return false;
    }
  };

  // ─────────────────────────────────────────
  // ✏️ METTRE À JOUR
  // ─────────────────────────────────────────
  const updateTraining = async (id, data) => {
    try {
      await updateDoc(doc(db, "formations", id), data);
      showSnack("Formation mise à jour avec succès", "success");
      return true;
    } catch (error) {
      console.error("Erreur update formation:", error);
      showSnack("Impossible de mettre à jour la formation", "error");
      return false;
    }
  };

  // ─────────────────────────────────────────
  // 🗑 SUPPRIMER
  // ─────────────────────────────────────────
  const deleteTraining = async (id) => {
    try {
      await deleteDoc(doc(db, "formations", id));
      showSnack("Formation supprimée avec succès", "success");
      return true;
    } catch (error) {
      console.error("Erreur suppression formation:", error);
      showSnack("Impossible de supprimer la formation", "error");
      return false;
    }
  };

  return {
    // Données
    trainings, // toutes les formations (pour le total)
    filteredTrainings, // formations filtrées (pour la liste)
    stats, // { all, planned, ongoing, completed }
    loading,

    // Filtre
    filter,
    setFilter,

    // CRUD
    createTraining,
    updateTraining,
    deleteTraining,

    // Snackbar
    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
  };
}
