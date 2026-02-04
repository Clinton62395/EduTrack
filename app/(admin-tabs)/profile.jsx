import { Box, Text } from "@/components/ui/theme";
import { SafeAreaView } from "react-native-safe-area-context";
export default function AdminProfile() {
  return (
    <SafeAreaView>
      <Box padding="m">
        <Text> Profil de l'administrateur </Text>
      </Box>
    </SafeAreaView>
  );
}
