import { useAuth } from "@/components/constants/authContext";
import { Box, Text } from "@/components/ui/theme";
import * as Haptics from "expo-haptics";
import { AlertCircle, Clock } from "lucide-react-native"; // Optionnel pour le style
import { useEffect, useState } from "react";
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
  expiresAt,
}) {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const { validateAttendance, loading } = useAttendance();
  const [error, setError] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  // 1. Logique du compte à rebours en temps réel
  useEffect(() => {
    if (!visible || !expiresAt) return;

    const checkExpiration = () => {
      const now = new Date().getTime();
      const expiry = expiresAt.toDate().getTime();

      if (now >= expiry) {
        setIsExpired(true);
        setError("Le temps est écoulé ! Demandez un nouveau code.");
      } else {
        setIsExpired(false);
      }
    };

    const timer = setInterval(checkExpiration, 1000);
    checkExpiration(); // Vérification immédiate à l'ouverture

    return () => clearInterval(timer);
  }, [visible, expiresAt]);

  const handleVerify = async () => {
    if (isExpired) {
      // Petite vibration d'avertissement si on clique alors que c'est expiré
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setError("");
    const result = await validateAttendance(
      trainingId,
      user.uid,
      code.trim(),
      trainingTitle,
    );

    if (result.success) {
      // ✅ Vibration de succès (douce et positive)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      onSuccess?.();
      onClose();
      setCode("");
    } else {
      // ❌ VIBRATION D'ERREUR (Le "vibreur magnifique" que tu as demandé)
      // Cela crée une série de vibrations rapides qui signalent une erreur
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      setError(result.message || "Code invalide");
      setCode("");
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
          {/* Indicateur de temps restant ou d'expiration */}
          {isExpired ? (
            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="errorBackground"
              padding="s"
              borderRadius="m"
              marginBottom="m"
            >
              <AlertCircle size={16} color="#EF4444" />
              <Text color="error" marginLeft="s" fontWeight="bold">
                Session expirée
              </Text>
            </Box>
          ) : (
            <Box flexDirection="row" alignItems="center" marginBottom="m">
              <Clock size={14} color="#6B7280" />
              <Text variant="caption" color="muted" marginLeft="s">
                Validation en cours...
              </Text>
            </Box>
          )}

          <Text variant="title" marginBottom="s">
            Code de Présence
          </Text>

          <Text
            variant="body"
            color="muted"
            textAlign="center"
            marginBottom="l"
          >
            {isExpired
              ? "Cette session d'appel est terminée."
              : `Entrez le code pour votre formation : ${trainingTitle}`}
          </Text>

          {/* Cases du code (grisées si expiré) */}
          <Box
            flexDirection="row"
            gap="m"
            marginBottom="l"
            opacity={isExpired ? 0.5 : 1}
          >
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

          <TextInput
            value={code}
            onChangeText={(t) => t.length <= 4 && setCode(t)}
            keyboardType="number-pad"
            autoFocus
            editable={!isExpired && !loading} // Bloque l'input si expiré
            style={{
              position: "absolute",
              opacity: 0,
              width: "100%",
              height: "100%",
            }}
          />

          {error ? (
            <Text variant="error" marginBottom="m" textAlign="center">
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={handleVerify}
            disabled={code.length < 4 || loading || isExpired}
            style={{ width: "100%" }}
          >
            <Box
              backgroundColor={
                code.length === 4 && !isExpired ? "primary" : "muted"
              }
              padding="m"
              borderRadius="m"
              alignItems="center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text color="white" fontWeight="bold">
                  {isExpired ? "Expiré" : "Valider la présence"}
                </Text>
              )}
            </Box>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
            <Text color="muted">Fermer</Text>
          </TouchableOpacity>
        </Box>
      </Box>
    </Modal>
  );
}
