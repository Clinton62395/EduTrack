import { Box, Text } from "@/components/ui/theme";
import { AlertTriangle, Eye, EyeOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { AppModal } from "./WrapperModal";

export function ConfirmModal({
  visible = false,
  onClose = () => {},
  onConfirm = async () => {},
  title = "Confirmation",
  message = "",
  loading = false,
  requiredMasterCode = null,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = true,
}) {
  const [masterCode, setMasterCode] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const cleanInput = masterCode?.trim().toUpperCase() || "";
  const cleanRequired = requiredMasterCode
    ? requiredMasterCode.trim().toUpperCase()
    : null;

  // Reset automatique quand on ferme
  useEffect(() => {
    if (!visible) {
      setMasterCode("");
      setError(null);
      setShowPassword(false);
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (loading) return;

    // Vérification masterCode uniquement si requis
    if (cleanRequired && cleanInput !== cleanRequired) {
      setError("Le code master est incorrect");
      return;
    }

    try {
      await onConfirm();
    } catch (err) {
      console.error("ConfirmModal error:", err);
      setError("Une erreur est survenue.");
    }
  };

  return (
    <AppModal
      visible={visible}
      onClose={!loading ? onClose : undefined}
      title={title}
      footerActions={[
        {
          label: cancelLabel,
          onPress: !loading ? onClose : undefined,
          variant: "outline",
          disabled: loading,
        },
        {
          label: confirmLabel,
          onPress: handleConfirm,
          variant: danger ? "danger" : "primary",
          loading: loading,
          disabled: loading || (cleanRequired && cleanInput.length === 0),
        },
      ]}
    >
      <Box alignItems="center" gap="s">
        <AlertTriangle size={40} color={danger ? "#DC2626" : "#2563EB"} />

        {message ? (
          <Text variant="body" textAlign="center" color="textSecondary">
            {message}
          </Text>
        ) : null}

        {cleanRequired && (
          <View style={styles.inputContainer}>
            <TextInput
              value={masterCode}
              onChangeText={(text) => {
                setMasterCode(text);
                if (error) setError(null);
              }}
              placeholder="Code master"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              autoCapitalize="characters"
              style={[styles.input, error && { borderColor: "#DC2626" }]}
            />

            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.icon}
            >
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <Text variant="caption" color="danger" marginTop="xs">
            {error}
          </Text>
        )}
      </Box>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "white",
    width: "100%",
    height: 48,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  icon: {
    marginLeft: 8,
  },
});
