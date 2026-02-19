import { db } from "@/components/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useLearnerTrainingDetail(trainingId, userId) {
  // Ajout de userId
  const [formation, setFormation] = useState(null);
  const [modules, setModules] = useState([]);
  const [completedModuleIds, setCompletedModuleIds] = useState([]); // Nouveau
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trainingId || !userId) {
      setLoading(false);
      return;
    }

    // 1. Écouter les détails de la formation
    const unsubTraining = onSnapshot(
      doc(db, "formations", trainingId),
      (snapshot) => {
        if (snapshot.exists()) {
          setFormation({ id: snapshot.id, ...snapshot.data() });
        }
      },
    );

    // 2. Écouter les modules
    const modulesQuery = query(
      collection(db, "formations", trainingId, "modules"),
      orderBy("order", "asc"),
    );
    const unsubModules = onSnapshot(modulesQuery, (snapshot) => {
      setModules(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // 3. NOUVEAU : Écouter la progression de l'élève
    // On suppose une collection 'user_progress' : { userId, trainingId, completedModules: [] }
    const progressDocRef = doc(db, "user_progress", `${userId}_${trainingId}`);
    const unsubProgress = onSnapshot(progressDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setCompletedModuleIds(snapshot.data().completedModules || []);
      } else {
        setCompletedModuleIds([]);
      }
      setLoading(false);
    });

    return () => {
      unsubTraining();
      unsubModules();
      unsubProgress();
    };
  }, [trainingId, userId]);

  // Calcul du pourcentage en temps réel
  const progressPercentage =
    modules.length > 0
      ? Math.round((completedModuleIds.length / modules.length) * 100)
      : 0;

  return {
    formation,
    modules,
    completedModuleIds,
    progressPercentage,
    loading,
  };
}
