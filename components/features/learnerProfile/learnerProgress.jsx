// components/ui/ProgressBar.jsx
import { Box, Text } from "@/components/ui/theme";
export function ProgressBar({ progress, label }) {
  // Sécurité pour ne pas dépasser 100%
  const width = Math.min(Math.max(progress, 0), 100);

  return (
    <Box marginTop="s">
      <Box flexDirection="row" justifyContent="space-between" marginBottom="xs">
        <Text variant="caption" color="muted">
          {label}
        </Text>
        <Text variant="caption" fontWeight="bold" color="primary">
          {width}%
        </Text>
      </Box>

      {/* Conteneur Gris */}
      <Box
        height={8}
        backgroundColor="secondaryBackground"
        borderRadius="rounded"
        overflow="hidden"
      >
        {/* Remplissage Bleu */}
        <Box
          height="100%"
          backgroundColor="primary"
          style={{ width: `${width}%` }}
        />
      </Box>
    </Box>
  );
}
