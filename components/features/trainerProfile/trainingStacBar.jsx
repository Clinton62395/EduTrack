import { Box, Text } from "@/components/ui/theme";
import { Calendar, Users } from "lucide-react-native";

const StatMini = ({ icon, label, value }) => (
  <Box alignItems="center">
    <Box flexDirection="row" alignItems="center" gap="xs">
      {icon}
      <Text fontWeight="700">{value}</Text>
    </Box>
    <Text variant="caption" color="muted">
      {label}
    </Text>
  </Box>
);

export function TrainingsStatsBar({ formations }) {
  return (
    <Box
      position="absolute"
      bottom={20}
      left={20}
      right={20}
      backgroundColor="white"
      padding="m"
      borderRadius="l"
      flexDirection="row"
      justifyContent="space-around"
      style={{ elevation: 5 }}
    >
      <StatMini
        icon={<Users size={16} color="#2563EB" />}
        label="Élèves"
        value={formations.reduce(
          (sum, f) => sum + (parseInt(f.currentLearners) || 0),
          0,
        )}
      />
      <StatMini
        icon={<Calendar size={16} color="#16A34A" />}
        label="Actives"
        value={formations.filter((f) => f.status === "ongoing").length}
      />
    </Box>
  );
}
