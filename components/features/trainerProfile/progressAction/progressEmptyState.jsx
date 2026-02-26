import { Box, Text } from "@/components/ui/theme";
import { TrendingUp } from "lucide-react-native";
import { StyleSheet } from "react-native";

export function EmptyState() {
  return (
    <Box
      padding="xl"
      alignItems="center"
      backgroundColor="white"
      borderRadius="xl"
      style={styles.card}
    >
      <TrendingUp size={48} color="#D1D5DB" />
      <Text color="muted" marginTop="m" textAlign="center">
        Aucune formation créée pour le moment.
      </Text>
      <Text variant="caption" color="muted" marginTop="s" textAlign="center">
        Créez votre première formation pour voir la progression de vos
        apprenants.
      </Text>
    </Box>
  );
}

export function StatBox({ icon, value, label, color }) {
  return (
    <Box
      flex={1}
      backgroundColor="white"
      borderRadius="l"
      padding="m"
      alignItems="center"
      gap="xs"
      style={styles.card}
    >
      <Box
        width={40}
        height={40}
        borderRadius="m"
        backgroundColor={color}
        justifyContent="center"
        alignItems="center"
      >
        {icon}
      </Box>
      <Text variant="body" fontWeight="bold">
        {value}
      </Text>
      <Text variant="caption" color="muted" textAlign="center">
        {label}
      </Text>
    </Box>
  );
}
const styles = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
});
