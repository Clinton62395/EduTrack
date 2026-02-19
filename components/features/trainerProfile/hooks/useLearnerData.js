import { db } from "@/components/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useLearnersData(trainingId) {
  const [learners, setLearners] = useState([]);
  const [totalModules, setTotalModules] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trainingId) return;

    const loadData = async () => {
      // 1. Compter le nombre total de modules pour cette formation
      const modulesSnap = await getDocs(
        collection(db, "formations", trainingId, "modules"),
      );
      const modulesCount = modulesSnap.size;
      setTotalModules(modulesCount);

      // 2. Écouter la formation pour avoir les participants
      const unsub = onSnapshot(
        doc(db, "formations", trainingId),
        async (trainingDoc) => {
          const participantIds = trainingDoc.data()?.participants || [];

          if (participantIds.length === 0) {
            setLearners([]);
            setLoading(false);
            return;
          }

          // 3. Récupérer les profils des utilisateurs
          const usersQ = query(
            collection(db, "users"),
            where("__name__", "in", participantIds),
          );
          const usersSnap = await getDocs(usersQ);

          // 4. Récupérer le progrès de chaque utilisateur
          const learnersWithProgress = await Promise.all(
            usersSnap.docs.map(async (uDoc) => {
              const userData = uDoc.data();
              const progressSnap = await getDocs(
                query(
                  collection(db, "user_progress"),
                  where("userId", "==", uDoc.id),
                  where("trainingId", "==", trainingId),
                ),
              );

              let completedCount = 0;
              if (!progressSnap.empty) {
                completedCount =
                  progressSnap.docs[0].data().completedModules?.length || 0;
              }

              return {
                id: uDoc.id,
                ...userData,
                progress:
                  modulesCount > 0
                    ? Math.round((completedCount / modulesCount) * 100)
                    : 0,
              };
            }),
          );

          setLearners(learnersWithProgress);
          setLoading(false);
        },
      );

      return unsub;
    };

    loadData();
  }, [trainingId]);

  return { learners, loading };
}
