import { forgotPasswordService } from "@/components/api/auth.api";
import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { Link } from "expo-router";
import { ArrowRight, KeyRound, Mail } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import EliteWaveBackground from "../../components/ui/waveBackground";
import { forgotPasswordSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";

export default function ForgotPasswordComponent() {
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [error, setError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useAuthForm(forgotPasswordSchema, { email: "" });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    setError(false);
    const res = await forgotPasswordService(email);
    setSnackbarMessage(res.message);
    setError(!res.success);
    setSnackbarVisible(true);
    setLoading(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ===== WAVE BACKGROUND ===== */}
      <EliteWaveBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ backgroundColor: "transparent" }}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* ===== CARD ===== */}
            <View style={styles.cardContainer}>
              <View style={styles.cardOverlay} />

              <Box padding="xl">
                {/* ===== HEADER ===== */}
                <Box alignItems="center" marginBottom="xl">
                  <Box
                    padding="l"
                    borderRadius="rounded"
                    marginBottom="m"
                    style={{
                      shadowColor: "#2563EB",
                      shadowOpacity: 0.2,
                      shadowRadius: 15,
                      elevation: 5,
                      borderWidth: 1,
                      borderColor: "rgba(37, 99, 235, 0.1)",
                    }}
                  >
                    <KeyRound size={36} color="#2563EB" />
                  </Box>

                  <Text
                    variant="hero"
                    color="primary"
                    textAlign="center"
                    marginBottom="xs"
                  >
                    EduTrack
                  </Text>

                  <Text variant="body" color="textSecondary" textAlign="center">
                    L'excellence dans le suivi de formation
                  </Text>
                </Box>

                {/* ===== TITRE ===== */}
                <Box marginBottom="l">
                  <Text variant="title" marginBottom="xs">
                    Mot de passe oublié ?
                  </Text>

                  <Text variant="body" color="textSecondary">
                    Entrez votre email pour recevoir un lien de réinitialisation
                  </Text>
                </Box>

                {/* ===== FORMULAIRE ===== */}
                <Box gap="m">
                  <InputField
                    control={control}
                    name="email"
                    label="Email"
                    placeholder="email@exemple.com"
                    keyboardType="email-address"
                    error={errors.email}
                    icon={<Mail size={20} color="#6B7280" />}
                    style={styles.input}
                  />

                  <Button
                    title={loading ? "Envoi en cours..." : "Envoyer le lien"}
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid || loading}
                    variant="primary"
                    marginTop="l"
                    icon={<ArrowRight size={20} color="white" />}
                  />
                </Box>

                {/* ===== FOOTER ===== */}
                <View style={styles.footerContainer}>
                  <Text variant="body" color="textSecondary">
                    Retour à la connexion ?{" "}
                    <Link href="/(auth)/login">
                      <Text color="primary" fontWeight="600">
                        Se connecter
                      </Text>
                    </Link>
                  </Text>
                </View>
              </Box>
            </View>

            {/* ===== SNACKBAR ===== */}
            <Snack
              visible={snackbarVisible}
              onDismiss={() => setSnackbarVisible(false)}
              type={error ? "error" : "success"}
              message={snackbarMessage}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#2563EB",
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 24,
  },
  iconContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 50,
    marginBottom: 16,
    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.1)",
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(229, 231, 235, 0.6)",
  },
  input: {
    backgroundColor: "white",
    borderColor: "rgba(229, 231, 235, 0.8)",
  },
});
