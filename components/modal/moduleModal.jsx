import { Box, Button, Text } from "@/components/ui/theme";
import { LayoutPanelLeft, Plus, X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddModuleModal({ visible, onClose, onAdd, loading }) {
  const [title, setTitle] = useState("");
  const insets = useSafeAreaInsets();

  const handleAdd = () => {
    if (title.trim().length < 3) return;
    onAdd(title.trim());
    setTitle(""); // reset après ajout
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Box flex={1} backgroundColor="overlayDark">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-end", // reste en bas
              paddingBottom: insets.bottom + 0,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Box
              backgroundColor="white"
              borderTopLeftRadius="xl"
              borderTopRightRadius="xl"
              padding="l"
            >
              {/* ===== HEADER ===== */}
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="l"
              >
                <Box flexDirection="row" alignItems="center" gap="s">
                  <LayoutPanelLeft size={20} color="#2563EB" />
                  <Text variant="title">Nouveau Module</Text>
                </Box>
                <Button
                  onPress={onClose}
                  icon={<X size={24} color="white" />}
                  iconPosition="right"
                  iconOnly
                  contentStyle={{ padding: 10 }}
                  style={{ with: 50 }}
                />
              </Box>

              {/* ===== LABEL ===== */}
              <Text variant="body" color="textSecondary" marginBottom="s">
                Titre du module
              </Text>

              {/* ===== INPUT ===== */}
              <Box
                backgroundColor="secondaryBackground"
                borderRadius="m"
                paddingHorizontal="m"
                marginBottom="xl"
                borderWidth={1}
                borderColor="border"
                justifyContent="center"
              >
                <TextInput
                  placeholder="Ex: Introduction au React Native"
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                />
              </Box>

              {/* ===== BUTTONS ===== */}
              <Box
                flexDirection="row"
                justifyContent="center"
                gap="m"
                alignItems="center"
                with="100%"
              >
                <Button
                  title="Annuler"
                  onPress={onClose}
                  variant="danger"
                  icon={<X size={18} color="white" />}
                  iconPosition="right"
                  style={{ flex: 1, color: "black" }}
                  contentStyle={{ paddingVertical: 8 }}
                />
                <Button
                  title={loading ? "Création..." : "Ajoute module"}
                  disabled={title.trim().length < 3 || loading}
                  onPress={handleAdd}
                  icon={<Plus size={18} color="white" />}
                  iconPosition="right"
                  style={{ flex: 1 }}
                  contentStyle={{ paddingVertical: 8 }}
                />
              </Box>
            </Box>
          </ScrollView>
        </KeyboardAvoidingView>
      </Box>
    </Modal>
  );
}
