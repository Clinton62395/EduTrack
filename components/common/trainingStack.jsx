// components/formations/FormationStats.jsx (Réutilisable)
import { Box, Text } from "@/components/ui/theme";

export function FormationStats({ formations = [] }) {
  const stats = {
    total: formations.length,
    ongoing: formations.filter((f) => f.status === "ongoing").length,
    totalLearners: formations.reduce((sum, f) => sum + f.currentLearners, 0),
    avgAttendance:
      formations.length > 0
        ? Math.round(
            formations.reduce((sum, f) => sum + f.attendanceRate, 0) /
              formations.length,
          )
        : 0,
  };

  return (
    <Box
      backgroundColor="white"
      padding="l"
      borderRadius="m"
      borderWidth={1}
      borderColor="border"
      flexDirection="row"
      justifyContent="space-around"
      flexWrap="wrap"
      gap="m"
    >
      <StatItem label="Formations" value={stats.total} color="#2563EB" />
      <StatItem label="En cours" value={stats.ongoing} color="#16A34A" />
      <StatItem
        label="Apprenants"
        value={stats.totalLearners}
        color="#7C3AED"
      />
      <StatItem
        label="Présence"
        value={`${stats.avgAttendance}%`}
        color="#F59E0B"
      />
    </Box>
  );
}

function StatItem({ label, value, color }) {
  return (
    <Box alignItems="center" minWidth={80}>
      <Box
        backgroundColor={`${color}15`}
        width={60}
        height={60}
        borderRadius={30}
        alignItems="center"
        justifyContent="center"
        marginBottom="s"
      >
        <Text variant="title" color={color} fontWeight="700">
          {value}
        </Text>
      </Box>
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </Box>
  );
}
