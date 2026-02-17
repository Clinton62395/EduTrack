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

  return (
    <Box
      backgroundColor="white"
      borderRadius="l"
      padding="m"
      marginBottom="l"
      style={{ elevation: 2 }}
    >
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="s"
      >
        <Text variant="body" fontWeight="bold" flex={1}>
          {training.title}
        </Text>
        <Text variant="caption" color="primary">
          {Math.round(progress * 100)}%
        </Text>
      </Box>

      <ProgressBar progress={progress} />

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
