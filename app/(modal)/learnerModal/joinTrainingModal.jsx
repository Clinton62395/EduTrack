import { Box, Button, Text } from "@/components/ui/theme";
import { InputField } from "@/hooks/auth/inputField";
import { ArrowRight, Hash, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Modal, Portal } from "react-native-paper";

export function JoinTrainingModal({ visible, onClose, onJoin, loading }) {
  const [error, setError] = useState(null);

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: { code: "" },
  });

  const codeValue = watch("code");

  useEffect(() => {
    if (!visible) {
      reset();
      setError(null);
    }
  }, [visible]);

  const onSubmit = async (data) => {
    if (!data.code.trim()) {
      setError("Le code est requis");
      return;
    }

    try {
      const success = await onJoin(data.code.trim().toUpperCase());
      if (success) {
        reset();
        onClose();
      }
    } catch (err) {
      console.error("Erreur joinTrainingModal:", err);
      setError("Une erreur est survenue");
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={{ margin: 20 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <Box
              backgroundColor="white"
              borderRadius="xl"
              padding="l"
              style={{
                elevation: 6,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 10 },
              }}
            >
              <ScrollView keyboardShouldPersistTaps="handled">
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom="l"
                >
                  <Text variant="title">Rejoindre une formation</Text>
                  <X size={24} color="#6B7280" onPress={onClose} />
                </Box>

                <Text variant="body" color="muted" marginBottom="m">
                  Entrez le code d'invitation à 8 caractères.
                </Text>

                <InputField
                  control={control}
                  name="code"
                  placeholder="Ex: AB12CD34"
                  icon={<Hash size={20} color="#2563EB" />}
                  autoCapitalize="characters"
                  maxLength={8}
                />

                {error && <Text variant="error">{error}</Text>}

                <Button
                  title="Valider le code"
                  onPress={handleSubmit(onSubmit)}
                  loading={loading}
                  disabled={loading || codeValue.trim().length === 0}
                  marginTop="xl"
                  icon={<ArrowRight size={20} color="white" />}
                  iconPosition="right"
                  variant={
                    codeValue.trim().length === 0 ? "outline" : "primary"
                  }
                />
              </ScrollView>
            </Box>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </Portal>
  );
}
