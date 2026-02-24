import { Box, Text } from "@/components/ui/theme";
import { BookOpen } from "lucide-react-native";
import { TouchableOpacity, StyleSheet } from "react-native";

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
      Ce module n'a pas encore de leçons.{"\n"}Appuyez sur le bouton pour
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
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  emptyButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
