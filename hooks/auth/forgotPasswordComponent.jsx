// ForgotPasswordComponent.tsx (version mise à jour)
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
} from "react-native";
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
    <Box flex={1} backgroundColor="primary">
      {/* ===== WAVE BACKGROUND ===== */}
      {/* <WaveBackground
        primaryColor="#2563EB"
        secondaryColor="#1D4ED8"
        variant="login"
      /> */}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Box flex={1} padding="xl" justifyContent="center">
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* ===== HEADER ===== */}
              <Box alignItems="center" marginBottom="xl">
                <Box
                  backgroundColor="infoBackground"
                  padding="l"
                  borderRadius="rounded"
                  marginBottom="m"
                >
                  <KeyRound size={40} color="white" />
                </Box>

                <Text
                  variant="hero"
                  color="white"
                  textAlign="center"
                  marginBottom="xs"
                >
                  EduTrack
                </Text>

                <Text variant="body" color="overlayLight" textAlign="center">
                  L'excellence dans le suivi de formation
                </Text>
              </Box>

              {/* ===== TITRE ===== */}
              <Box marginBottom="l">
                <Text variant="title" color="white" marginBottom="xs">
                  Mot de passe oublié ?
                </Text>

                <Text variant="body" color="overlayLight">
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
                />

                <Button
                  title={loading ? "Envoi en cours..." : "Envoyer le lien"}
                  onPress={handleSubmit(onSubmit)}
                  disabled={!isValid || loading}
                  variant="secondary"
                  marginTop="l"
                  icon={<ArrowRight size={20} color="white" />}
                />
              </Box>

              {/* ===== FOOTER ===== */}
              <Box alignItems="center" marginTop="xl" paddingTop="l">
                <Text variant="body" color="overlayLight">
                  Retour à la connexion ?{" "}
                  <Link href="/(auth)/login">
                    <Text color="white" fontWeight="700">
                      Se connecter
                    </Text>
                  </Link>
                </Text>
              </Box>

              {/* ===== SNACKBAR ===== */}
              <Snack
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                type={error ? "error" : "success"}
                message={snackbarMessage}
              />
            </Animated.View>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
}
