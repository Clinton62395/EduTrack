import { forgotPasswordService } from "@/components/api/useAuth.api";
import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text, ms } from "@/components/ui/theme";
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
import {
  forgotPasswordSchema,
  useAuthForm,
} from "../../hooks/auth/fromValidator";
import { InputField } from "../../hooks/auth/inputField";

export default function ForgotPassword() {
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
            paddingHorizontal: ms(20),
            paddingVertical: ms(40),
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
                      shadowRadius: ms(15),
                      elevation: ms(5),
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
    borderRadius: ms(24),
    overflow: "hidden",
    position: "relative",
    shadowColor: "#2563EB",
    shadowOpacity: 0.15,
    shadowRadius: ms(30),
    shadowOffset: { width: 0, height: ms(10) },
    elevation: ms(10),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: ms(24),
  },
  iconContainer: {
    backgroundColor: "white",
    padding: ms(20),
    borderRadius: ms(50),
    marginBottom: ms(16),
    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: ms(15),
    elevation: ms(5),
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.1)",
  },
  footerContainer: {
    alignItems: "center",
    marginTop: ms(32),
    paddingTop: ms(20),
    borderTopWidth: 1,
    borderTopColor: "rgba(229, 231, 235, 0.6)",
  },
  input: {
    backgroundColor: "white",
    borderColor: "rgba(229, 231, 235, 0.8)",
  },
});
