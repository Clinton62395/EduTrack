import { db } from "@/components/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { sendModuleNotification } from "../components/helpers/notificationHelper/sendModuleNotification";

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

      // const docRef = await addDoc(
      //   collection(db, "formations", formationId, "modules"),
      //   {
      //     title: title.trim(),
      //     order: modules.length + 1,
      //     createdAt: serverTimestamp(),
      //     updatedAt: serverTimestamp(),
      //   },
      // );

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

      await updateDoc(doc(db, "formations", formationId, "modules", moduleId), {
        title: newTitle.trim(),
        updatedAt: serverTimestamp(),
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

      const batch = writeBatch(db);

      // suppression
      batch.delete(doc(db, "formations", formationId, "modules", moduleId));

      // reindexation propre
      const remaining = modules.filter((m) => m.id !== moduleId);

      remaining.forEach((module, index) => {
        const ref = doc(db, "formations", formationId, "modules", module.id);
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

      const batch = writeBatch(db);

      newOrder.forEach((module, index) => {
        const ref = doc(db, "formations", formationId, "modules", module.id);
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
