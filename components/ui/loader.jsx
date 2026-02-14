import { Box, Text } from "@/components/ui/theme";
import { ActivityIndicator } from "react-native";

export function MyLoader({ message = "Chargement..." }) {
  return (
    <Box flex={1} justifyContent="center" alignItems="center">
      <ActivityIndicator size="large" color="#2563EB" />

      {message && (
        <Text variant="caption" color="muted" marginTop="s">
          {message}
        </Text>
      )}
    </Box>
  );
}
