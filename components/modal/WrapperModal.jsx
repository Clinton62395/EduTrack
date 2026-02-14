import { Box, Button, Text } from "@/components/ui/theme";
import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { Modal, Portal } from "react-native-paper";

export function AppModal({
  visible,
  onClose,
  title,
  children,
  footerActions,
  loading = false,
}) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={!loading ? onClose : undefined}
        dismissable={!loading}
        contentContainerStyle={{
          backgroundColor: "white",
          padding: 24,
          marginHorizontal: 20,
          marginBottom: keyboardHeight > 0 ? keyboardHeight : 20,
          borderRadius: 28,
          elevation: 5,
        }}
      >
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

        <Box marginBottom="l">{children}</Box>

        {footerActions && (
          <Box
            flexDirection="row"
            justifyContent="space-between"
            gap="m"
            width="100%"
            marginTop="s"
          >
            {footerActions.map((action) => (
              <Box key={action.label} style={{ flex: 1 }}>
                <Button
                  title={action.label}
                  variant={action.variant || "primary"}
                  onPress={action.onPress}
                  loading={action.loading || loading}
                  disabled={action.disabled || loading}
                />
              </Box>
            ))}
          </Box>
        )}
      </Modal>
    </Portal>
  );
}
