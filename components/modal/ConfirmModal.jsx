import { Box, Text } from "@/components/ui/theme";
import { AlertTriangle, Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { AppModal } from "./WrapperModal";

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  onError,
  loading = false,
  requiredMasterCode,
}) {
  const [masterCode, setMasterCode] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  // const {user} = useAuth();

  const cleanInput = masterCode.trim().toUpperCase();
  const cleanRequired = requiredMasterCode.trim().toUpperCase();


  const handleConfirm = () => {
    if (requiredMasterCode && cleanInput !== cleanRequired) {
      setError("Le code master est incorrect");
      onError?.("Le code master est incorrect");
      return;
    }
    onConfirm();
    setError(null);
    setMasterCode("");
  };

  return (
    <AppModal
      visible={visible}
      onClose={!loading ? onClose : undefined}
      title={title}
      footerActions={[
        {
          label: "Annuler",
          onPress: loading ? undefined : onClose,
          variant: "outline",
          disabled: loading,
        },
        {
          label: "Supprimer",
          onPress: handleConfirm,
          variant: "danger",
          loading: loading,
          disabled: loading,
        },
      ]}
    >
      <Box alignItems="center" gap="s">
        <AlertTriangle size={40} color="#DC2626" />
        <Text variant="body" textAlign="center" color="textSecondary">
          {message}
        </Text>

        {requiredMasterCode && (
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
              style={[styles.input, error && { borderColor: "#DC2626" }]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
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
