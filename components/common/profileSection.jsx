// components/profile/ProfileSection.jsx
import { Box, Text } from "@/components/ui/theme";
import { ChevronRight } from "lucide-react-native";
import { Pressable } from "react-native";

export function ProfileSection({
  title,
  children,
  actionLabel,
  onAction,
  showDivider = true,
}) {
  return (
    <Box marginBottom="l">
      {/* Header de section */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="m"
        marginHorizontal="m"
      >
        <Text variant="subtitle" color="text">
          {title}
        </Text>

        {actionLabel && (
          <Pressable
            onPress={onAction}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Text variant="caption" color="primary" fontWeight="500">
              {actionLabel}
            </Text>
            <ChevronRight size={16} color="#2563EB" />
          </Pressable>
        )}
      </Box>

      {/* Contenu */}
      <Box
        backgroundColor="white"
        borderRadius="m"
        borderWidth={1}
        borderColor="border"
        overflow="hidden"
      >
        {children}
      </Box>

      {/* Divider optionnel */}
      {showDivider && <Box height={1} backgroundColor="border" marginTop="l" />}
    </Box>
  );
}
