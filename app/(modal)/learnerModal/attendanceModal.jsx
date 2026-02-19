import { useAuth } from "@/components/constants/authContext";
import { Box, Text } from "@/components/ui/theme";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useAttendance } from "../../../components/features/learnerProfile/hooks/useAttendance";

export function AttendanceModal({
  visible,
  onClose,
  trainingId,
  onSuccess,
  trainingTitle,
}) {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const { validateAttendance, loading } = useAttendance();

  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    const result = await validateAttendance(
      trainingId,
      user.uid,
      code,
      trainingTitle,
    );

    if (result.success) {
      onSuccess?.(); // Pour déclencher une petite animation de succès
      onClose();
    } else {
      setError(result.message || "Code invalide");
      setCode(""); // On reset le code en cas d'erreur
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="overlayDark"
      >
        <Box
          backgroundColor="white"
          padding="xl"
          borderRadius="xl"
          width="85%"
          alignItems="center"
        >
          <Text variant="hero" marginBottom="s">
            Code de Présence
          </Text>
          <Text
            variant="body"
            color="muted"
            textAlign="center"
            marginBottom="l"
          >
            Entrez le code à 4 chiffres affiché par votre formateur.
          </Text>

          {/* Affichage des 4 cases stylées */}
          <Box flexDirection="row" gap="m" marginBottom="l">
            {[0, 1, 2, 3].map((i) => (
              <Box
                key={i}
                width={50}
                height={55}
                borderWidth={2}
                borderColor={code[i] ? "primary" : "secondaryBackground"}
                borderRadius="m"
                justifyContent="center"
                alignItems="center"
                backgroundColor={code[i] ? "white" : "secondaryBackground"}
              >
                <Text variant="hero" color="primary">
                  {code[i] || ""}
                </Text>
              </Box>
            ))}
          </Box>

          {/* Input invisible pour capturer le clavier numérique */}
          <TextInput
            value={code}
            onChangeText={(t) => t.length <= 4 && setCode(t)}
            keyboardType="number-pad"
            autoFocus
            style={{
              position: "absolute",
              opacity: 0,
              width: "100%",
              height: "100%",
            }}
          />

          {error ? (
            <Text variant="error" marginBottom="m">
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={handleVerify}
            disabled={code.length < 4 || loading}
            style={{ width: "100%" }}
          >
            <Box
              backgroundColor={code.length === 4 ? "primary" : "muted"}
              padding="m"
              borderRadius="m"
              alignItems="center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text color="white" fontWeight="bold">
                  Valider
                </Text>
              )}
            </Box>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
            <Text color="muted">Annuler</Text>
          </TouchableOpacity>
        </Box>
      </Box>
    </Modal>
  );
}
