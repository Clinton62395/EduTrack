// components/ui/AppModal.js
import { Box, Button, Text } from "@/components/ui/theme";
import { Modal, Portal } from "react-native-paper";
export function AppModal({
  visible,
  onClose,
  title,
  children,
  footerActions, // Array d'objets pour les boutons [{label, onPress, variant}]
  loading = false,
}) {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={{
          backgroundColor: "white",
          padding: 24,
          margin: 20,
          borderRadius: 28, // Style Material 3
          elevation: 5, // Ombre sur Android
          shadowColor: "#000", // Ombre sur iOS
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }}
      >
        {/* Petit indicateur de design en haut */}
        <Box
          width={40}
          height={4}
          backgroundColor="border"
          borderRadius="s"
          alignSelf="center"
          marginBottom="m"
          opacity={0.5}
        />

        {title && (
          <Text variant="title" marginBottom="l" textAlign="center">
            {title}
          </Text>
        )}

        {/* Contenu dynamique */}
        <Box marginBottom="l">{children}</Box>

        {/* Pied de page dynamique */}
        {footerActions && (
          <Box
            flexDirection="row"
            justifyContent="space-between" // Change center pour space-between
            gap="m"
            width="100%" // Force la largeur complète du modal
            marginTop="s"
          >
            {footerActions.map((action, index) => (
              <Box key={index} style={{ flex: 1 }}>
                <Button
                  title={action.label}
                  variant={action.variant || "primary"}
                  onPress={action.onPress}
                  loading={action.loading || loading}
                  disabled={action.disabled}
                />
              </Box>
            ))}
          </Box>
        )}
      </Modal>
    </Portal>
  );
}
