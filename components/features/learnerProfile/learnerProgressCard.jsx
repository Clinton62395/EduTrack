import { Box, Text } from "@/components/ui/theme";
import { useLearnerProgress } from "./hooks/useLearnerProgress";
import { ProgressBar } from "./learnerProgressBar";

export function TrainingProgressCard({ training, userId }) {
  const { completedLessonIds, loading } = useLearnerProgress(
    userId,
    training.id,
  );

  if (loading) return null;

  const completedCount = completedLessonIds.length;

  return (
    <Box marginTop="m">
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="s"
      >
        <Text variant="caption" color="muted">
          {completedCount} leçon{completedCount > 1 ? "s" : ""} terminée
          {completedCount > 1 ? "s" : ""}
        </Text>
        {completedCount > 0 && (
          <Text variant="caption" fontWeight="bold" color="primary">
            En cours ✓
          </Text>
        )}
      </Box>

      <ProgressBar progress={completedCount > 0 ? 100 : 0} />
    </Box>
  );
}
