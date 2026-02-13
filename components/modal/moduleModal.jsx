import { Box, Button, Text } from "@/components/ui/theme";
import { LayoutPanelLeft, Plus, Save, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Modal, Portal } from "react-native-paper";

export default function AddModuleModal({
  visible,
  onClose,
  onSubmit,
  loading,
  module = null,
}) {
  const [title, setTitle] = useState("");
  const isEdit = useMemo(() => !!module, [module]);

  useEffect(() => {
    if (visible) {
      setTitle(module?.title || "");
    }
  }, [visible, module]);

  const isValid = title.trim().length >= 3;

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed.length < 3 || loading) return;
    onSubmit({
      id: module?.id || null,
      title: trimmed,
    });
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        // Style Premium : Centré, arrondi, ombre légère
        contentContainerStyle={{
          backgroundColor: "white",
          margin: 20,
          borderRadius: 28,
          padding: 24,
          elevation: 5,
          overflow: "hidden",
          maxHeight: "80%",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          {/* HEADER */}
          <ScrollView
            bounces={false}
            contentContainerStyle={{ padding: 15 }}
            keyboardShouldPersistTaps="handled"
          >
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginBottom="l"
            >
              <Box flexDirection="row" alignItems="center" gap="s">
                <LayoutPanelLeft size={22} color="#2563EB" />
                <Text variant="title">
                  {isEdit ? "Modifier le module" : "Nouveau module"}
                </Text>
              </Box>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </Box>

            {/* INPUT SECTION */}
            <Text variant="body" color="textSecondary" marginBottom="s">
              Titre du module
            </Text>

            <Box
              backgroundColor="secondaryBackground"
              borderRadius="m"
              paddingHorizontal="m"
              paddingVertical="s"
              marginBottom="s"
              borderWidth={1}
              borderColor={isValid ? "border" : "danger"}
            >
              <TextInput
                placeholder="Ex: Introduction au React Native"
                value={title}
                onChangeText={setTitle}
                autoFocus
                style={{ fontSize: 16, height: 40 }}
              />
            </Box>

            {!isValid && title.length > 0 && (
              <Text variant="caption" color="danger" marginBottom="l">
                Le titre doit contenir au moins 3 caractères
              </Text>
            )}

            {/* ACTIONS */}
            <Box
              flexDirection="row"
              gap="m"
              marginTop="l"
              justifyContent="center"
            >
              <Box flex={0.8}>
                <Button
                  title="Annuler"
                  onPress={onClose}
                  variant="outline"
                  iconPosition="right"
                />
              </Box>
              <Box flex={1}>
                <Button
                  title={
                    loading ? "Envoi..." : isEdit ? "Enregistrer" : "Créer"
                  }
                  disabled={!isValid || loading}
                  onPress={handleSubmit}
                  variant="primary"
                  iconPosition="right"
                  icon={
                    isEdit ? (
                      <Save size={18} color="white" />
                    ) : (
                      <Plus size={18} color="white" />
                    )
                  }
                />
              </Box>
            </Box>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}
