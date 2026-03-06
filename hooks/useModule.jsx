import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { sendModuleNotification } from "../components/helpers/notificationHelper/sendModuleNotification";

export function useModules(formationId) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Snack State... (inchangé)

  // 📦 LISTEN REALTIME
  useEffect(() => {
    if (!formationId) {
      setModules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = db
      .collection("formations")
      .doc(formationId)
      .collection("modules")
      .orderBy("order", "asc")
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setModules(data);
          setLoading(false);
        },
        (error) => {
          console.error("Erreur native modules:", error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [formationId]);

  // ➕ ADD MODULE (Avec incrémentation du compteur)
  const addModule = async (title) => {
    if (!title?.trim()) return;

    try {
      setActionLoading(true);
      const batch = firestore().batch();

      const formationRef = db.collection("formations").doc(formationId);
      const newModuleRef = formationRef.collection("modules").doc();

      // Création du module
      batch.set(newModuleRef, {
        title: title.trim(),
        order: modules.length + 1,
        lessonsCount: 0, // ✅ Initialisation du compteur de leçons interne
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // ✅ Mise à jour du compteur global sur la formation
      batch.update(formationRef, {
        totalModules: firestore.FieldValue.increment(1),
      });

      await batch.commit();

      sendModuleNotification(title.trim(), formationId).catch(console.error);
    } catch (error) {
      console.error("Add Module Error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // 🗑 DELETE MODULE (Avec décrémentation et nettoyage)
  const deleteModule = async (module) => {
    try {
      setActionLoading(true);
      const batch = firestore().batch();
      const formationRef = db.collection("formations").doc(formationId);
      const moduleRef = formationRef.collection("modules").doc(module.id);

      // 1. Suppression du module
      batch.delete(moduleRef);

      // 2. Décrémentation du compteur de modules
      batch.update(formationRef, {
        totalModules: firestore.FieldValue.increment(-1),
        // On retire aussi ses leçons du total global de la formation
        totalLessons: firestore.FieldValue.increment(
          -(module.lessonsCount || 0),
        ),
      });

      // 3. Réorganisation de l'ordre des modules restants
      const remaining = modules.filter((m) => m.id !== module.id);
      remaining.forEach((m, index) => {
        const ref = formationRef.collection("modules").doc(m.id);
        batch.update(ref, { order: index + 1 });
      });

      await batch.commit();
    } catch (error) {
      console.error("Delete Error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // ... reorderModules (inchangé)

  return {
    modules,
    loading,
    actionLoading,
    addModule,
    deleteModule,
    // ...
  };
}
