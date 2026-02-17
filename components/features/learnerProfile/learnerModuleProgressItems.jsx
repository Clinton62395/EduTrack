import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import { CheckCircle2, Circle } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { useToggleModule } from "./hooks/useModuleToggle";

export function ModuleProgressItem({
  module,
  isCompleted,
  userId,
  trainingId,
}) {
  const { toggleStatus, toggleLoading } = useToggleModule();

  const handlePress = async () => {
    if (toggleLoading) return;
    await toggleStatus(userId, trainingId, module.id, isCompleted);
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={toggleLoading}>
      <Box flexDirection="row" alignItems="center" paddingVertical="s">
        {toggleLoading ? (
          <MyLoader message="Chargement..." />
        ) : isCompleted ? (
          <CheckCircle2 size={20} color="#10B981" />
        ) : (
          <Circle size={20} color="#D1D5DB" />
        )}
        <Text
          variant="body"
          marginLeft="s"
          style={{
            textDecorationLine: isCompleted ? "line-through" : "none",
            color: isCompleted ? "#9CA3AF" : "#1F2937",
          }}
        >
          {module.title}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
