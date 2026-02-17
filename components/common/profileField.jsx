// components/profile/ProfileField.jsx
import { Box, Text } from "@/components/ui/theme";
import { Check, Edit2, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput } from "react-native";

export function ProfileField({
  label,
  value,
  placeholder = "Non renseigné",
  editable = true,
  onSave,
  multiline = false,
  keyboardType = "default",
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");

  const handleSave = () => {
    if (onSave) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  return (
    <Box
      padding="m"
      borderBottomWidth={1}
      borderBottomColor="border"
      flexDirection="row"
      justifyContent="space-between"
      alignItems={multiline ? "flex-start" : "center"}
    >
      <Box flex={1}>
        <Text variant="caption" color="muted" marginBottom="xs">
          {label}
        </Text>

        {isEditing ? (
          <Box>
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              style={{
                fontSize: 16,
                color: "#111827",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 6,
                padding: 8,
                backgroundColor: "#F9FAFB",
              }}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
              keyboardType={keyboardType}
              autoFocus
            />
            <Box flexDirection="row" gap="s" marginTop="s">
              <Pressable onPress={handleSave}>
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <Check size={16} color="#2563EB" />
                  <Text variant="caption" color="primary">
                    Valider
                  </Text>
                </Box>
              </Pressable>
              <Pressable onPress={handleCancel}>
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <X size={16} color="#DC2626" />
                  <Text variant="caption" color="danger">
                    Annuler
                  </Text>
                </Box>
              </Pressable>
            </Box>
          </Box>
        ) : (
          <Text variant="body" color={value ? "text" : "muted"}>
            {value || placeholder}
          </Text>
        )}
      </Box>

      {editable && !isEditing && (
        <Pressable onPress={() => setIsEditing(true)}>
          <Edit2 size={18} color="#6B7280" />
        </Pressable>
      )}
    </Box>
  );
}
