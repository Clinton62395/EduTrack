import { Box, Text } from "@/components/ui/theme";
import { CalendarCheck } from "lucide-react-native";
import { StyleSheet } from "react-native";

export function EmptySelection() {
  return (
    <Box
      padding="xl"
      alignItems="center"
      backgroundColor="white"
      borderRadius="xl"
      style={styles.card}
    >
      <CalendarCheck size={48} color="#D1D5DB" />
      <Text color="muted" marginTop="m" textAlign="center">
        Sélectionnez une formation pour voir l&apos;historique de présence.
      </Text>
    </Box>
  );
}

export function EmptySessions() {
  return (
    <Box
      padding="xl"
      alignItems="center"
      backgroundColor="white"
      borderRadius="xl"
      style={styles.card}
    >
      <CalendarCheck size={48} color="#D1D5DB" />
      <Text color="muted" marginTop="m" textAlign="center">
        Aucune session de présence pour cette formation.
      </Text>
      <Text variant="caption" color="muted" marginTop="s" textAlign="center">
        Lancez une session depuis le détail de la formation.
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
