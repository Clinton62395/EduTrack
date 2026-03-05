import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { sendModuleNotification } from "../components/helpers/notificationHelper/sendModuleNotification";
// Firestore operations use db methods; FieldValue via firestore.FieldValue

export function useModules(formationId) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState("success");

  const showSnack = (message, type = "success") => {
    setSnackMessage(message);
    setSnackType(type);
    setSnackVisible(true);
  };

  const dismissSnack = () => setSnackVisible(false);

  // ===============================
  // 📦 LISTEN REALTIME
  // ===============================
  useEffect(() => {
    if (!formationId) {
      setModules([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const baseRef = db
      .collection("formations")
      .doc(formationId)
      .collection("modules");

    const q = baseRef.orderBy("order", "asc");

    const unsubscribe = q.onSnapshot(
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
        showSnack("Erreur lors du chargement", "error");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [formationId]);

  // ===============================
  // ➕ ADD
  // ===============================
  const addModule = async (title) => {
    if (!title?.trim()) {
      showSnack("Le titre est requis", "error");
      return;
    }

    try {
      setActionLoading(true);

      const docRef = await db
        .collection("formations")
        .doc(formationId)
        .collection("modules")
        .add({
          title: title.trim(),
          order: modules.length + 1,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      sendModuleNotification(title.trim(), formationId).catch(console.error);
      showSnack("Module ajouté avec succès", "success");
    } catch (error) {
      console.error(error);
      showSnack("Impossible d'ajouter le module", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ===============================
  // ✏️ UPDATE
  // ===============================
  const updateModule = async (moduleId, newTitle) => {
    if (!newTitle?.trim()) {
      showSnack("Le titre est requis", "error");
      return;
    }

    try {
      setActionLoading(true);

      await db
        .collection("formations")
        .doc(formationId)
        .collection("modules")
        .doc(moduleId)
        .update({
          title: newTitle.trim(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      showSnack("Module modifié", "success");
    } catch (error) {
      console.error(error);
      showSnack("Impossible de modifier", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ===============================
  // 🗑 DELETE
  // ===============================
  const deleteModule = async (moduleId) => {
    try {
      setActionLoading(true);

      const batch = db.batch();

      // suppression
      batch.delete(
        db
          .collection("formations")
          .doc(formationId)
          .collection("modules")
          .doc(moduleId),
      );

      // reindexation propre
      const remaining = modules.filter((m) => m.id !== moduleId);

      remaining.forEach((module, index) => {
        const ref = db
          .collection("formations")
          .doc(formationId)
          .collection("modules")
          .doc(module.id);
        batch.update(ref, { order: index + 1 });
      });

      await batch.commit();

      showSnack("Module supprimé", "success");
    } catch (error) {
      console.error(error);
      showSnack("Impossible de supprimer", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ===============================
  // 🔄 REORDER
  // ===============================
  const reorderModules = async (newOrder) => {
    try {
      setActionLoading(true);

      const batch = db.batch();

      newOrder.forEach((module, index) => {
        const ref = db
          .collection("formations")
          .doc(formationId)
          .collection("modules")
          .doc(module.id);
        batch.update(ref, { order: index + 1 });
      });

      await batch.commit();
      showSnack("Ordre mis à jour", "success");
    } catch (error) {
      console.error(error);
      showSnack("Impossible de réorganiser", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    modules,
    loading,
    actionLoading,

    addModule,
    updateModule,
    deleteModule,
    reorderModules,

    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
    showSnack,
  };
}
