import { Box, Button, Text } from "@/components/ui/theme";
import { LayoutPanelLeft, X } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, TextInput } from "react-native";

export default function AddModuleModal({ visible, onClose, onAdd, loading }) {
  const [title, setTitle] = useState("");
  
  

  const handleAdd = () => {
    if (title.trim().length < 3) return;
    onAdd(title);
    setTitle(""); // Reset après ajout
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Box flex={1} backgroundColor="overlayDark" justifyContent="flex-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Box
            backgroundColor="white"
            borderTopLeftRadius="xl"
            borderTopRightRadius="xl"
            padding="l"
            style={{ paddingBottom: 40 }}
          >
            {/* Header du Modal */}
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
                variant="ghost"
                onPress={onClose}
                icon={<X size={24} color="#64748B" />}
              />
            </Box>

            <Text variant="body" color="textSecondary" marginBottom="s">
              Titre du module
            </Text>

            {/* Input stylisé */}
            <Box
              backgroundColor="secondaryBackground"
              borderRadius="m"
              paddingHorizontal="m"
              marginBottom="xl"
              borderWidth={1}
              borderColor="border"
            >
              <TextInput
                placeholder="Ex: Introduction au React Native"
                value={title}
                onChangeText={setTitle}
                autoFocus
                style={{ height: 50, fontSize: 16, color: "#0F172A" }}
              />
            </Box>

            <Box flexDirection="row" gap="m">
              <Button
                flex={1}
                title="Annuler"
                variant="outline"
                onPress={onClose}
              />
              <Button
                flex={2}
                title={loading ? "Création..." : "Ajouter le module"}
                disabled={title.trim().length < 3 || loading}
                onPress={handleAdd}
              />
            </Box>
          </Box>
        </KeyboardAvoidingView>
      </Box>
    </Modal>
  );
}
