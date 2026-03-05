import { Copy } from "lucide-react-native";
import { Pressable } from "react-native";
import { Box, Text } from "@/components/ui/theme";

function CodeItem({ label, value, onCopy }) {
  return (
    <Box flex={1}>
      <Text variant="body" color="muted">
        {label}
      </Text>
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text variant="title" color="primary">
          {value || `no ${label.toLowerCase()} code`}
        </Text>
        <Pressable onPress={() => onCopy(value)} hitSlop={8}>
          <Copy size={20} color="#2563EB" />
        </Pressable>
      </Box>
    </Box>
  );
}

export function InvitationCodesCard({ invitationCode, masterCode, onCopy }) {
  return (
    <Box
      marginHorizontal="m"
      marginTop="m"
      padding="s"
      backgroundColor="white"
      borderRadius="l"
      borderLeftWidth={4}
      borderLeftColor="primary"
    >
      <Box
        flexDirection={!invitationCode ? "column" : "row"}
        justifyContent="space-between"
        marginTop="s"
        gap="l"
        width="100%"
      >
        <CodeItem label="Invitation" value={invitationCode} onCopy={onCopy} />
        <CodeItem label="Master" value={masterCode} onCopy={onCopy} />
      </Box>
    </Box>
  );
}
