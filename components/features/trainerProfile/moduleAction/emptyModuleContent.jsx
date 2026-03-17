import { Box, Text } from "@/components/ui/theme";
import { BookOpen } from "lucide-react-native";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ms } from "../../../ui/theme";

export const EmptyModuleContent = ({ onAdd }) => (
  <Box
    flex={1}
    padding="xl"
    alignItems="center"
    justifyContent="center"
    backgroundColor="white"
    borderRadius="xl"
    style={styles.emptyCard}
  >
    <BookOpen size={48} color="#D1D5DB" />
    <Text
      variant="body"
      color="muted"
      textAlign="center"
      marginTop="m"
      marginBottom="l"
    >
      Ce module n&apos;a pas encore de leçons.{"\n"}Appuyez sur le bouton pour
      commencer.
    </Text>
    <TouchableOpacity onPress={onAdd} style={styles.emptyButton}>
      <Text color="white" fontWeight="bold">
        Ajouter une leçon
      </Text>
    </TouchableOpacity>
  </Box>
);

const styles = StyleSheet.create({
  emptyCard: {
    elevation: ms(2),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: ms(10),
  },
  emptyButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: ms(24),
    paddingVertical: ms(12),
    borderRadius: ms(10),
  },
});
