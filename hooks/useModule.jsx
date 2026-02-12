// hooks/useModules.js
import { db } from "@/components/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch, // ← AJOUT pour update
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export function useModules(formationId) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔔 Snackbar - MÊME PATTERN que useCreateTraining et useUpdateTraining
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState("success"); // "success" ou "error"

  const showSnack = (message, type = "success") => {
    setSnackMessage(message);
    setSnackType(type);
    setSnackVisible(true);
  };

  const dismissSnack = () => setSnackVisible(false);

  // 📦 ÉCOUTE FIRESTORE
  useEffect(() => {
    if (!formationId) {
      setLoading(false);
      setModules([]);
      return;
    }

    const q = query(
      collection(db, "formations", formationId, "modules"),
      orderBy("order", "asc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setModules(data);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur chargement modules:", error);
        showSnack("Erreur lors du chargement des modules", "error");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [formationId]);

  // ➕ AJOUTER un module
  const addModule = async (title) => {
    if (!title?.trim()) {
      showSnack("Le titre est requis", "error");
      return;
    }

    try {
      await addDoc(collection(db, "formations", formationId, "modules"), {
        title: title.trim(),
        order: modules.length + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      showSnack("Module ajouté avec succès", "success");
    } catch (error) {
      console.error("Erreur ajout module:", error);
      showSnack("Impossible d'ajouter le module", "error");
    }
  };

  // ✏️ MODIFIER un module
  const updateModule = async (moduleId, newTitle) => {
    if (!newTitle?.trim()) {
      showSnack("Le titre est requis", "error");
      return;
    }

    try {
      await updateDoc(doc(db, "formations", formationId, "modules", moduleId), {
        title: newTitle.trim(),
        updatedAt: serverTimestamp(),
      });

      showSnack("Module modifié avec succès", "success");
    } catch (error) {
      console.error("Erreur modification module:", error);
      showSnack("Impossible de modifier le module", "error");
    }
  };

  // 🗑️ SUPPRIMER un module (avec confirmation)
  const deleteModule = async (moduleId) => {
    Alert.alert(
      "Supprimer le module",
      "Cette action est irréversible. Voulez-vous continuer ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(
                doc(db, "formations", formationId, "modules", moduleId),
              );

              showSnack("Module supprimé avec succès", "success");
            } catch (error) {
              console.error("Erreur suppression module:", error);
              showSnack("Impossible de supprimer le module", "error");
            }
          },
        },
      ],
    );
  };

  // 🔄 RÉORDONNER les modules
  const reorderModules = async (newOrder) => {
    try {
      const batch = writeBatch(db);

      newOrder.forEach((module, index) => {
        const ref = doc(db, "formations", formationId, "modules", module.id);
        batch.update(ref, { order: index + 1 });
      });

      await batch.commit();
      showSnack("Ordre mis à jour", "success");
    } catch (error) {
      console.error("Erreur réorganisation:", error);
      showSnack("Impossible de réorganiser", "error");
    }
  };

  return {
    // Data
    modules,
    loading,

    // CRUD
    addModule,
    updateModule, // ← NOUVEAU
    deleteModule,
    reorderModules, // ← NOUVEAU

    // Snackbar - MÊME NOMS que les autres hooks !
    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
  };
}
