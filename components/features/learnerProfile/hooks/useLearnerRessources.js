import { db } from "@/components/lib/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useLearnerResources(userId) {
  const [trainingsWithModules, setTrainingsWithModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // 1. On récupère les formations où l'utilisateur est inscrit
    const q = query(
      collection(db, "formations"),
      where("participants", "array-contains", userId),
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const trainingsData = [];

      for (const trainingDoc of snapshot.docs) {
        const trainingId = trainingDoc.id;

        // 2. Pour chaque formation, on va chercher ses modules (sous-collection)
        const modulesSnap = await getDocs(
          collection(db, "formations", trainingId, "modules"),
        );

        // On transforme les documents modules en objets exploitables
        const modulesList = modulesSnap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => (a.order || 0) - (b.order || 0)); // Tri par ordre

        trainingsData.push({
          id: trainingId,
          ...trainingDoc.data(),
          modules: modulesList, // C'est cette liste que ton écran utilise pour le .map()
        });
      }

      setTrainingsWithModules(trainingsData);
      setLoading(false);
    });

    return unsub;
  }, [userId]);

  return { trainingsWithModules, loading };
}
