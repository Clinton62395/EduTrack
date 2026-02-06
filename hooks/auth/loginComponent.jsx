import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { Link } from "expo-router";
import { ArrowRight, Lock, LogIn, Mail } from "lucide-react-native";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useLogin } from "../useLogin";
import { loginSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";

export default function LoginComponent() {
  const {
    loading,
    snackbarVisible,
    snackbarMessage,
    error,
    setSnackbarVisible,
    onSubmit,
  } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useAuthForm(loginSchema, {
    email: "",
    password: "",
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      {/* ===== BACKGROUND WAVES ===== */}
      {/* <WaveBackground /> */}

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ===== CARD ===== */}
        <Box
          backgroundColor="white"
          borderRadius="xl"
          padding="xl"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 20,
            elevation: 6,
          }}
        >
          {/* ===== HEADER ===== */}
          <Box alignItems="center" marginBottom="l">
            <Box
              backgroundColor="infoBackground"
              padding="l"
              borderRadius="rounded"
              marginBottom="m"
            >
              <LogIn size={36} color="#2563EB" />
            </Box>

            <Text variant="hero" color="primary" textAlign="center">
              EduTrack
            </Text>

            <Text
              variant="body"
              color="textSecondary"
              textAlign="center"
              marginTop="xs"
            >
              L&apos;excellence dans le suivi de formation
            </Text>
          </Box>

          {/* ===== TITRE ===== */}
          <Box marginBottom="m">
            <Text variant="title" marginBottom="xs">
              Bienvenue 👋
            </Text>
            <Text variant="body" color="textSecondary">
              Connectez-vous pour accéder à votre espace
            </Text>
          </Box>

          {/* ===== FORM ===== */}
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

            <Box>
              <InputField
                control={control}
                name="password"
                label="Mot de passe"
                placeholder="••••••••"
                secureTextEntry
                error={errors.password}
                icon={<Lock size={20} color="#6B7280" />}
              />

              <Box alignItems="flex-end" marginTop="s">
                <Link href="/(auth)/forgotPassword">
                  <Text variant="caption" color="primary" fontWeight="600">
                    Mot de passe oublié ?
                  </Text>
                </Link>
              </Box>
            </Box>

            <Button
              title={loading ? "Vérification..." : "Se connecter"}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || loading}
              variant="primary"
              marginTop="m"
              icon={<ArrowRight size={20} color="white" />}
            />
          </Box>

          {/* ===== FOOTER ===== */}
          <Box alignItems="center" marginTop="l">
            <Text variant="body" color="textSecondary">
              Pas encore de compte ?{" "}
              <Link href="/(auth)/register">
                <Text color="primary" fontWeight="700">
                  S&apos;inscrire
                </Text>
              </Link>
            </Text>
          </Box>
        </Box>

        {/* ===== SNACKBAR ===== */}
        <Snack
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          type={error ? "error" : "success"}
          message={snackbarMessage}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
