import { Box, Text } from "@/components/ui/theme";
import { HelpCircle } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

export const QuizCard = ({ onPress }) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
    <Box
      borderRadius="l"
      padding="m"
      marginTop="s"
      flexDirection="row"
      alignItems="center"
      gap="m"
      borderWidth={2}
      borderColor="primary"
      backgroundColor="white"
      /* Remplacement du StyleSheet */
      elevation={1}
      shadowColor="black"
      shadowOpacity={0.04}
      shadowRadius={6}
    >
      <Box
        width={44}
        height={44}
        borderRadius="m"
        backgroundColor="secondaryBackground"
        justifyContent="center"
        alignItems="center"
      >
        <HelpCircle size={24} color="#2563EB" />
      </Box>

      <Box flex={1}>
        <Text variant="body" fontWeight="bold" color="primary">
          Quiz du module
        </Text>
        <Text variant="caption">Gérer les questions</Text>
      </Box>
    </Box>
  </TouchableOpacity>
);
