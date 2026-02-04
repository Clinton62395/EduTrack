import { Box, Text } from "@/components/ui/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrainerStudents() {
  return (
    <SafeAreaView>
      <Box padding="m">
        <Text> Liste des apprenants du formateur </Text>
      </Box>
    </SafeAreaView>
  );
}
