import { Box, Text } from "@/components/ui/theme";
import { SafeAreaView } from "react-native-safe-area-context";
export default function LearnerAttendance() {
  return (
    <SafeAreaView>
      <Box padding="m">
        <Text> Présence des apprenants </Text>
      </Box>
    </SafeAreaView>
  );
}
