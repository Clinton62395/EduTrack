import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";
import { useEffect, useMemo, useState } from "react";

// ─────────────────────────────────────────
// 🧮 sessionStatus calculé depuis les dates (indépendant du status métier)
// ─────────────────────────────────────────
function getSessionStatus(training) {
  const now = new Date();
  const start = training.startDate ? new Date(training.startDate) : null;
  const end = training.endDate ? new Date(training.endDate) : null;

  if (!start || !end || isNaN(start) || isNaN(end)) return "planned";
  if (now > end) return "completed";
  if (now >= start) return "ongoing";
  return "planned";
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

    const unsub = onSnapshot(
      query(collection(db, "formations"), where("trainerId", "==", user.uid)),
      (snapshot) => {
        const data = snapshot.docs.map((d) => {
          const formation = { id: d.id, ...d.data() };
          return {
            ...formation,
            // status = champ Firestore (draft / published / archived)
            // sessionStatus = calculé depuis les dates
            status: formation.status || "draft",
            sessionStatus: getSessionStatus(formation),
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

    return () => unsub();
  }, [user?.uid]);

  // ─────────────────────────────────────────
  // 🔍 FILTRAGE
  // ─────────────────────────────────────────
  const filteredTrainings = useMemo(() => {
    if (filter === "all") return trainings;
    return trainings.filter((t) => t.status === filter);
  }, [trainings, filter]);

  // ─────────────────────────────────────────
  // 📊 STATS
  // ─────────────────────────────────────────
  const stats = useMemo(
    () => ({
      all: trainings.length,
      draft: trainings.filter((t) => t.status === "draft").length,
      published: trainings.filter((t) => t.status === "published").length,
      archived: trainings.filter((t) => t.status === "archived").length,
    }),
    [trainings],
  );

  // ─────────────────────────────────────────
  // ➕ CRÉER (status: "draft" par défaut)
  // ─────────────────────────────────────────
  const createTraining = async (trainingData) => {
    try {
      await addDoc(collection(db, "formations"), {
        ...trainingData,
        status: "draft",
        codeActive: false, // Le code est inactif jusqu'à la publication
        createdAt: serverTimestamp(),
      });
      showSnack("Formation créée avec succès");
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
      await updateDoc(doc(db, "formations", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      showSnack("Formation mise à jour avec succès");
      return true;
    } catch (error) {
      console.error("Erreur update formation:", error);
      showSnack("Impossible de mettre à jour la formation", "error");
      return false;
    }
  };

  // ─────────────────────────────────────────
  // 🚀 PUBLIER — active le code d'invitation
  // ─────────────────────────────────────────
  const publishTraining = async (id) => {
    try {
      await updateDoc(doc(db, "formations", id), {
        status: "published",
        codeActive: true,
        publishedAt: serverTimestamp(),
      });
      showSnack("Formation publiée ! Le code d'invitation est actif.");
      return true;
    } catch (error) {
      console.error("Erreur publication:", error);
      showSnack("Impossible de publier la formation", "error");
      return false;
    }
  };

  // ─────────────────────────────────────────
  // ⏸ DÉPUBLIER — désactive le code sans supprimer
  // ─────────────────────────────────────────
  const unpublishTraining = async (id) => {
    try {
      await updateDoc(doc(db, "formations", id), {
        status: "draft",
        codeActive: false,
        updatedAt: serverTimestamp(),
      });
      showSnack("Formation dépubliée. Le code d'invitation est désactivé.");
      return true;
    } catch (error) {
      console.error("Erreur dépublication:", error);
      showSnack("Impossible de dépublier la formation", "error");
      return false;
    }
  };

  // ─────────────────────────────────────────
  // 🗑 SUPPRIMER
  // ─────────────────────────────────────────
  const deleteTraining = async (id) => {
    try {
      await deleteDoc(doc(db, "formations", id));
      showSnack("Formation supprimée avec succès");
      return true;
    } catch (error) {
      console.error("Erreur suppression formation:", error);
      showSnack("Impossible de supprimer la formation", "error");
      return false;
    }
  };

  return {
    trainings,
    filteredTrainings,
    stats,
    loading,
    filter,
    setFilter,
    createTraining,
    updateTraining,
    publishTraining,
    unpublishTraining,
    deleteTraining,
    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
  };
}
