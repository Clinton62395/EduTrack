import { Box, Text } from "@/components/ui/theme";
import { AlertTriangle } from "lucide-react-native";
import { AppModal } from "./WrapperModal";

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}) {
  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={title}
      footerActions={[
        { label: "Annuler", onPress: onClose, variant: "outline" },
        {
          label: "Supprimer",
          onPress: onConfirm,
          variant: "danger",
          loading: loading,
        },
      ]}
    >
      <Box alignItems="center" gap="s">
        <AlertTriangle size={40} color="#DC2626" />
        <Text variant="body" textAlign="center" color="textSecondary">
          {message}
        </Text>
      </Box>
    </AppModal>
  );
}
