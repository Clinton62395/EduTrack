import { db } from "@/components/lib/firebase";
import {
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { sendModuleNotification } from "../components/helpers/notificationHelper/sendModuleNotification";

export function useModules(formationId) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ─────────────────────────────────────────
  // 📦 LISTEN REALTIME
  // ─────────────────────────────────────────
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
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setModules(data);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur modules:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [formationId]);

  // ─────────────────────────────────────────
  // ➕ ADD MODULE
  // ✅ Accepte un objet { title, passingScore }
  // ─────────────────────────────────────────
  const addModule = async ({ title, passingScore = 70 }) => {
    if (!title?.trim()) return;

    try {
      setActionLoading(true);
      const batch = writeBatch(db);

      const formationRef = doc(db, "formations", formationId);
      const newModuleRef = doc(
        collection(db, "formations", formationId, "modules"),
      );

      batch.set(newModuleRef, {
        title: title.trim(),
        passingScore, 
        order: modules.length + 1,
        lessonsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch.update(formationRef, {
        totalModules: increment(1),
      });

      await batch.commit();
      sendModuleNotification(title.trim(), formationId).catch(console.error);
    } catch (error) {
      console.error("Add Module Error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // ✏️ UPDATE MODULE
  // ✅ Nouveau — manquait dans l'ancienne version
  // ─────────────────────────────────────────
  const updateModule = async (moduleId, { title, passingScore }) => {
    if (!moduleId || !title?.trim()) return;

    try {
      setActionLoading(true);
      await updateDoc(doc(db, "formations", formationId, "modules", moduleId), {
        title: title.trim(),
        passingScore: passingScore ?? 70,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Update Module Error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🗑 DELETE MODULE
  // ─────────────────────────────────────────
  const deleteModule = async (module) => {
    try {
      setActionLoading(true);
      const batch = writeBatch(db);

      const formationRef = doc(db, "formations", formationId);
      const moduleRef = doc(
        db,
        "formations",
        formationId,
        "modules",
        module.id,
      );

      batch.delete(moduleRef);

      batch.update(formationRef, {
        totalModules: increment(-1),
        totalLessons: increment(-(module.lessonsCount || 0)),
      });

      const remaining = modules.filter((m) => m.id !== module.id);
      remaining.forEach((m, index) => {
        batch.update(doc(db, "formations", formationId, "modules", m.id), {
          order: index + 1,
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Delete Module Error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 🔀 REORDER MODULES
  // ─────────────────────────────────────────
  const reorderModules = async (newOrder) => {
    try {
      setActionLoading(true);
      const batch = writeBatch(db);

      newOrder.forEach((m, index) => {
        batch.update(doc(db, "formations", formationId, "modules", m.id), {
          order: index + 1,
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Reorder Modules Error:", error);
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
  };
}
