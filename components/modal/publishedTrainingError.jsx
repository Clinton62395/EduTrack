import { Box, Text } from "@/components/ui/theme";
import { AlertTriangle } from "lucide-react-native";
import { AppModal } from "./WrapperModal";

/**
 * Modal d'erreur de publication
 * Affiché quand la checklist de publication échoue
 */
export function PublishErrorModal({ visible, onClose, reason }) {
  // Parse le message pour extraire les noms de modules si présents
  const lines = reason ? reason.split(". ") : [];

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Publication impossible"
      footerActions={[
        {
          label: "Compris",
          variant: "primary",
          onPress: onClose,
        },
      ]}
    >
      {/* Icône */}
      <Box alignItems="center" marginBottom="l">
        <Box
          width={64}
          height={64}
          borderRadius="rounded"
          backgroundColor="warningBackground"
          justifyContent="center"
          alignItems="center"
        >
          <AlertTriangle size={30} color="#F59E0B" />
        </Box>
      </Box>

      {/* Message principal */}
      <Box
        backgroundColor="secondaryBackground"
        padding="m"
        borderRadius="l"
        borderLeftWidth={3}
        borderLeftColor="warning"
      >
        <Text
          variant="body"
          color="text"
          style={{ lineHeight: 22 }}
          textAlign="center"
        >
          {reason}
        </Text>
      </Box>

      {/* Conseil */}
      <Box marginTop="m">
        <Text variant="caption" color="muted" textAlign="center">
          Complétez le contenu manquant ou supprimez les modules vides avant de
          publier.
        </Text>
      </Box>
    </AppModal>
  );
}
