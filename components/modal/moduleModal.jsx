import { Box, Button, Text } from "@/components/ui/theme";
import { LayoutPanelLeft, Plus, Save, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddModuleModal({
  visible,
  onClose,
  onSubmit, // renommé pour être générique
  loading,
  module = null, // on passe tout l'objet
}) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");

  const isEdit = useMemo(() => !!module, [module]);

  // Sync automatique
  useEffect(() => {
    if (visible) {
      setTitle(module?.title || "");
    }
  }, [visible, module]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed.length < 3 || loading) return;

    onSubmit({
      id: module?.id || null,
      title: trimmed,
    });
  };

  const isValid = title.trim().length >= 3;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Box flex={1} backgroundColor="overlayDark">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-end",
              paddingBottom: insets.bottom,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Box
              backgroundColor="white"
              borderTopLeftRadius="xl"
              borderTopRightRadius="xl"
              padding="l"
            >
              {/* HEADER */}
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="l"
              >
                <Box flexDirection="row" alignItems="center" gap="s">
                  <LayoutPanelLeft size={20} color="#2563EB" />
                  <Text variant="title">
                    {isEdit ? "Modifier le module" : "Nouveau module"}
                  </Text>
                </Box>

                <Button
                  onPress={onClose}
                  icon={<X size={22} color="white" />}
                  iconOnly
                  iconPosition="right"
                />
              </Box>

              {/* LABEL */}
              <Text variant="body" color="textSecondary" marginBottom="s">
                Titre du module
              </Text>

              {/* INPUT */}
              <Box
                backgroundColor="secondaryBackground"
                borderRadius="m"
                paddingHorizontal="m"
                marginBottom="xl"
                borderWidth={1}
                borderColor={isValid ? "border" : "danger"}
                justifyContent="center"
              >
                <TextInput
                  placeholder="Ex: Introduction au React Native"
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                />
              </Box>

              {!isValid && (
                <Text variant="caption" color="danger" marginBottom="m">
                  Le titre doit contenir au moins 3 caractères
                </Text>
              )}

              {/* BUTTONS */}
              <Box flexDirection="row" justifyContent="space-between" gap="m">
                <Button
                  title="Annuler"
                  onPress={onClose}
                  variant="danger"
                  style={{ flex: 1 }}
                />

                <Button
                  title={
                    loading
                      ? isEdit
                        ? "Modification..."
                        : "Création..."
                      : isEdit
                        ? "Enregistrer"
                        : "Créer"
                  }
                  disabled={!isValid || loading}
                  onPress={handleSubmit}
                  icon={
                    isEdit ? (
                      <Save size={18} color="white" />
                    ) : (
                      <Plus size={18} color="white" />
                    )
                  }
                  iconPosition="right"
                  style={{ flex: 1 }}
                />
              </Box>
            </Box>
          </ScrollView>
        </KeyboardAvoidingView>
      </Box>
    </Modal>
  );
}
