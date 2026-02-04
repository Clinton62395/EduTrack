// components/profile/ProfileStats.jsx
import { Box, Text } from "@/components/ui/theme";
export function ProfileStats({ stats }) {
  return (
    <Box
      flexDirection="row"
      justifyContent="space-around"
      backgroundColor="white"
      padding="l"
      borderRadius="m"
      borderWidth={1}
      borderColor="border"
    >
      {stats.map((stat, index) => (
        <Box key={index} alignItems="center">
          <Box
            backgroundColor="background"
            padding="m"
            borderRadius="m"
            marginBottom="s"
          >
            {stat.icon && <stat.icon size={24} color="#2563EB" />}
          </Box>
          <Text variant="title" fontWeight="700">
            {stat.value}
          </Text>
          <Text variant="caption" color="muted">
            {stat.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
