import { db } from "@/components/lib/firebase";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useLearnerProgress(userId, trainingId) {
  const [modules, setModules] = useState([]);
  const [completedModuleIds, setCompletedModuleIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !trainingId) return;

    // 1. Charger tous les modules de la formation
    const fetchModules = async () => {
      const snap = await getDocs(
        collection(db, "formations", trainingId, "modules"),
      );
      setModules(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    // 2. Écouter le progrès de l'utilisateur
    const unsubProgress = onSnapshot(
      doc(db, "user_progress", `${userId}_${trainingId}`),
      (doc) => {
        if (doc.exists()) {
          setCompletedModuleIds(doc.data().completedModules || []);
        }
        setLoading(false);
      },
    );

    fetchModules();
    return unsubProgress;
  }, [userId, trainingId]);

  // Fonction pour cocher/décocher un module
  const toggleModule = async (moduleId) => {
    const progressRef = doc(db, "user_progress", `${userId}_${trainingId}`);
    const isCompleted = completedModuleIds.includes(moduleId);

    try {
      await setDoc(
        progressRef,
        {
          userId,
          trainingId,
          completedModules: isCompleted
            ? arrayRemove(moduleId)
            : arrayUnion(moduleId),
        },
        { merge: true },
      );
    } catch (e) {
      console.error("Erreur progrès:", e);
    }
  };

  const progressPercentage =
    modules.length > 0
      ? Math.round((completedModuleIds.length / modules.length) * 100)
      : 0;

  return {
    modules,
    completedModuleIds,
    progressPercentage,
    toggleModule,
    loading,
  };
}
