import { db } from "@/components/lib/firebase";
import { useEffect, useState } from "react";
// firestore operations via db

export function useLearnerResources(userId) {
  const [trainingsWithModules, setTrainingsWithModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const q = db
      .collection("formations")
      .where("participants", "array-contains", userId);

    const unsub = q.onSnapshot(async (snapshot) => {
      const trainingsData = [];

      for (const trainingDoc of snapshot.docs) {
        const trainingId = trainingDoc.id;

        // 1. Récupère les modules
        const modulesSnap = await db
          .collection("formations")
          .doc(trainingId)
          .collection("modules")
          .get();

        const modulesList = [];

        for (const moduleDoc of modulesSnap.docs) {
          // 2. Pour chaque module → récupère ses leçons
          const lessonsSnap = await db
            .collection("formations")
            .doc(trainingId)
            .collection("modules")
            .doc(moduleDoc.id)
            .collection("lessons")
            .get();

          const lessons = lessonsSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          modulesList.push({
            id: moduleDoc.id,
            ...moduleDoc.data(),
            lessons,
          });
        }

        modulesList.sort((a, b) => (a.order || 0) - (b.order || 0));

        trainingsData.push({
          id: trainingId,
          ...trainingDoc.data(),
          modules: modulesList,
        });
      }

      setTrainingsWithModules(trainingsData);
      setLoading(false);
    });

    return unsub;
  }, [userId]);

  return { trainingsWithModules, loading };
}
