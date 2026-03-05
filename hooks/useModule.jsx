import { db } from "@/components/lib/firebase"; // Ton instance firestore()
import firestore from "@react-native-firebase/firestore"; // Import requis pour les utilitaires statiques
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
  // 📦 LISTEN REALTIME (Syntaxe Native)
  // ===============================
  useEffect(() => {
    if (!formationId) {
      setModules([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // .collection() .doc() .collection() est la chaîne native standard
    const unsubscribe = db
      .collection("formations")
      .doc(formationId)
      .collection("modules")
      .orderBy("order", "asc")
      .onSnapshot(
        (snapshot) => {
          // Sur le SDK natif, snapshot.docs est un tableau d'objets DocumentSnapshot
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setModules(data);
          setLoading(false);
        },
        (error) => {
          console.error("Erreur native modules:", error);
          showSnack("Erreur lors du chargement", "error");
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [formationId]);

  // ===============================
  // ➕ ADD (Native Syntax)
  // ===============================
  const addModule = async (title) => {
    if (!title?.trim()) return showSnack("Le titre est requis", "error");

    try {
      setActionLoading(true);

      // On crée la référence directement
      await db
        .collection("formations")
        .doc(formationId)
        .collection("modules")
        .add({
          title: title.trim(),
          order: modules.length + 1,
          // ✅ Utilisation de firestore.FieldValue natif
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      sendModuleNotification(title.trim(), formationId).catch(console.error);
      showSnack("Module ajouté avec succès", "success");
    } catch (error) {
      console.error("Add Module Error:", error);
      showSnack("Impossible d'ajouter le module", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ===============================
  // 🗑 DELETE & REORDER (Native Batch)
  // ===============================
  const deleteModule = async (moduleId) => {
    try {
      setActionLoading(true);

      // ✅ Création d'un write batch natif
      const batch = firestore().batch();

      const moduleRef = db
        .collection("formations")
        .doc(formationId)
        .collection("modules")
        .doc(moduleId);

      batch.delete(moduleRef);

      // Re-calcul de l'ordre
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
      console.error("Delete Error:", error);
      showSnack("Impossible de supprimer", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ===============================
  // 🔄 REORDER (Native Batch)
  // ===============================
  const reorderModules = async (newOrder) => {
    try {
      setActionLoading(true);
      const batch = firestore().batch();

      newOrder.forEach((module, index) => {
        const ref = db
          .collection("formations")
          .doc(formationId)
          .collection("modules")
          .doc(module.id);

        batch.update(ref, {
          order: index + 1,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      showSnack("Ordre mis à jour", "success");
    } catch (error) {
      console.error("Reorder Error:", error);
      showSnack("Erreur de réorganisation", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    modules,
    loading,
    actionLoading,
    addModule,
    deleteModule,
    reorderModules,
    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
  };
}
