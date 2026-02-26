import { Box, Text } from "@/components/ui/theme";
import { ChevronRight, HelpCircle, Lock } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

export function QuizCard({ allLessonsCompleted, totalCount, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={allLessonsCompleted ? 0.8 : 1}
      disabled={!allLessonsCompleted}
      onPress={onPress}
    >
      <Box
        backgroundColor={allLessonsCompleted ? "white" : "secondaryBackground"}
        borderRadius="l"
        padding="m"
        marginTop="s"
        flexDirection="row"
        alignItems="center"
        gap="m"
        borderWidth={2}
        borderColor={allLessonsCompleted ? "primary" : "border"}
        opacity={allLessonsCompleted ? 1 : 0.6}
        /* remplacement du StyleSheet ici */
        elevation={allLessonsCompleted ? 1 : 0}
        shadowColor="black"
        shadowOpacity={allLessonsCompleted ? 0.04 : 0}
        shadowRadius={allLessonsCompleted ? 6 : 0}
      >
        <Box
          width={44}
          height={44}
          borderRadius="m"
          backgroundColor={
            allLessonsCompleted ? "successLight" : "secondaryBackground"
          }
          justifyContent="center"
          alignItems="center"
        >
          {allLessonsCompleted ? (
            <HelpCircle size={24} color="#2563EB" />
          ) : (
            <Lock size={24} color="#9CA3AF" />
          )}
        </Box>

        <Box flex={1}>
          <Text
            variant="body"
            fontWeight="bold"
            color={allLessonsCompleted ? "primary" : "muted"}
          >
            Quiz du module
          </Text>

          <Text variant="caption">
            {allLessonsCompleted
              ? "Testez vos connaissances"
              : `Terminez les ${totalCount} leçon${
                  totalCount > 1 ? "s" : ""
                } pour débloquer`}
          </Text>
        </Box>

        {allLessonsCompleted && <ChevronRight size={20} color="#2563EB" />}
      </Box>
    </TouchableOpacity>
  );
}
