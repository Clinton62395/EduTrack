import { Box, Text } from "@/components/ui/theme";
import { useLearnerProgress } from "./hooks/useLearnerProgress";
import { ProgressBar } from "./learnerProgressBar";

export function TrainingProgressCard({ training, userId }) {
  // On extrait les données réelles depuis TON hook
  const { modules, completedModuleIds, progressPercentage, loading } =
    useLearnerProgress(userId, training.id);

  if (loading) return null; // Ou un petit squelette de chargement

  const totalModules = modules.length;
  const completedCount = completedModuleIds.length;

  return (
    <Box marginTop="m">
      {/* Ligne pourcentage + compteur */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="s"
      >
        <Text variant="caption" color="muted">
          {completedCount}/{totalModules} leçons terminées
        </Text>
        <Text variant="caption" fontWeight="bold" color="primary">
          {progressPercentage}%
        </Text>
      </Box>

      {/* Barre de progression : on passe le pourcentage au composant */}
      <ProgressBar progress={progressPercentage} />

      {/* Note : On n'affiche pas les ModuleProgressItem ici sur le Dashboard 
         car cela prendrait trop de place (30 modules x 10 formations).
         On garde cette liste pour l'écran de détails !
      */}
    </Box>
  );
}
