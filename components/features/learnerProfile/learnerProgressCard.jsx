import { db } from "@/components/lib/firebase";
import { Box, Text } from "@/components/ui/theme";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ModuleProgressItem } from "./learnerModuleProgressItems";
import { ProgressBar } from "./learnerProgressBar";

export function TrainingProgressCard({ training, userId }) {
  const [completedIds, setCompletedIds] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "userProgress"),
      where("userId", "==", userId),
      where("trainingId", "==", training.id),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ids = snapshot.docs.map((doc) => doc.data().moduleId);
      setCompletedIds(ids);
    });
    return () => unsubscribe();
  }, [userId, training.id]);

  const totalModules = training.modules?.length || 0;
  const completedCount = completedIds.length;
  const progress = totalModules > 0 ? completedCount / totalModules : 0;
  const percentage = Math.round(progress * 100);

  return (
    <Box marginBottom="l">
      {/* Ligne pourcentage + compteur */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="s"
      >
        <Text variant="caption" color="muted">
          {completedCount}/{totalModules} modules complétés
        </Text>
        <Text variant="caption" fontWeight="bold" color="primary">
          {percentage}%
        </Text>
      </Box>

      {/* Barre de progression */}
      <ProgressBar progress={progress} />

      {/* Modules */}
      <Box marginTop="m">
        {training.modules?.map((module) => (
          <ModuleProgressItem
            key={module.id}
            module={module}
            userId={userId}
            trainingId={training.id}
            isCompleted={completedIds.includes(module.id)}
          />
        ))}
      </Box>
    </Box>
  );
}
