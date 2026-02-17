import { Box, Text } from "@/components/ui/theme";

export function SmallStatCard({ icon, label, value }) {
  return (
    <Box
      flex={1}
      backgroundColor="secondaryBackground"
      padding="s"
      borderRadius="m"
      flexDirection="row"
      alignItems="center"
      gap="s"
    >
      {icon}
      <Box>
        <Text variant="caption" color="muted" style={{ fontSize: 10 }}>
          {label}
        </Text>
        <Text variant="body" fontWeight="bold">
          {value}
        </Text>
      </Box>
    </Box>
  );
}
