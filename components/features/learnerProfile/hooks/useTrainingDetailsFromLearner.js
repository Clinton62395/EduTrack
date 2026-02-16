import { db } from "@/components/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useLearnerTrainingDetail(trainingId) {
  const [formation, setFormation] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trainingId) return;

    // 1. Écouter les détails de la formation
    const unsubTraining = onSnapshot(
      doc(db, "formations", trainingId),
      (snapshot) => {
        if (snapshot.exists()) {
          setFormation({ id: snapshot.id, ...snapshot.data() });
        }
        setLoading(false);
      },
    );

    // 2. Écouter les modules de cette formation
    const modulesQuery = query(
      collection(db, "formations", trainingId, "modules"),
      orderBy("order", "asc"),
    );

    const unsubModules = onSnapshot(modulesQuery, (snapshot) => {
      const modulesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setModules(modulesData);
    });

    return () => {
      unsubTraining();
      unsubModules();
    };
  }, [trainingId]);

  return { formation, modules, loading };
}
