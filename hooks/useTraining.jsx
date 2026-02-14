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
import { useEffect, useState } from "react";

export function useTrainings() {
  // 🔔 Snackbar state
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState("success");

  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonctions pour le snackbar
  const showSnack = (message, type = "success") => {
    setSnackMessage(message);
    setSnackType(type);
    setSnackVisible(true);
  };

  const dismissSnack = () => {
    setSnackVisible(false);
  };

  // 🔴 ÉCOUTE FIRESTORE
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
        setTrainings(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            coverImage: d.data().coverImage || null,
          })),
        );
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

  // 🔴 CRUD
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
  // --- ✅ Mettre à jour une formation

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
    trainings,
    updateTraining,
    loading,
    createTraining,
    deleteTraining,
    // 🔔 Exposer le snackbar
    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
  };
}
