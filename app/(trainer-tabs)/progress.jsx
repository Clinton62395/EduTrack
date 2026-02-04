import { Box, Text } from "@/components/ui/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrainerProgress() {
  return (
    <SafeAreaView>
      <Box padding="m">
        <Text> Progression du formateur </Text>
      </Box>
    </SafeAreaView>
  );
}
