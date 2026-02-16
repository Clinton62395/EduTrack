import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { Link } from "expo-router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
} from "lucide-react-native";
import { useState } from "react";
import { useWatch } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import EliteWaveBackground from "../../components/ui/waveBackground";
import { useLogin } from "../useLogin";
import { loginSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";

export default function LoginComponent() {
  const [showPassword, setShowPassword] = useState(true);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const {
    snackbarVisible,
    snackbarMessage,
    onSubmit,
    dismissSnack,
    snackType,
  } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting: loading },
  } = useAuthForm(loginSchema, {
    email: "",
    password: "",
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });
  return (
    <Box style={{ flex: 1 }}>
      {/* ===== BACKGROUND WAVES ===== */}
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: "transparent" }}
        >
          {/* ===== CARD ===== */}
          <Box
            backgroundColor="overlayLight"
            borderRadius="xl"
            padding="s"
            style={{
              shadowColor: "#2563EB",
              shadowOpacity: 0.15,
              shadowRadius: 30,
              shadowOffset: { width: 0, height: 10 },
              elevation: 10,
              overflow: "hidden",
              position: "relative",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.5)",
            }}
          >
            {/* ===== HEADER ===== */}
            <Box alignItems="center" marginBottom="l">
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
              <Text variant="title" marginBottom="xs" textAlign="center">
                Bienvenue 👋
              </Text>
              <Text variant="body" color="textSecondary" textAlign="center">
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
                <Box position="relative">
                  <InputField
                    control={control}
                    name="password"
                    label="Mot de passe"
                    placeholder="••••••••"
                    secureTextEntry={showPassword}
                    error={errors.password}
                    icon={<Lock size={20} color="#6B7280" />}
                  />
                  {/* Icône de masquage du mot de passe */}
                  {passwordValue.length > 0 && (
                    <TouchableOpacity
                      onPress={handleTogglePassword}
                      activeOpacity={0.7}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: 44,
                      }}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#6B7280" />
                      ) : (
                        <Eye size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                  )}
                </Box>

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
                loading={loading}
                disabled={!isValid || loading}
                variant="primary"
                marginTop="m"
                icon={<ArrowRight size={20} color="white" />}
                style={{
                  shadowColor: "#2563EB",
                  shadowOpacity: 0.3,
                  shadowRadius: 15,
                  shadowOffset: { width: 0, height: 5 },
                }}
              />
            </Box>

            {/* ===== FOOTER ===== */}
            <Box
              alignItems="center"
              marginTop="l"
              paddingTop="m"
              style={{
                borderTopWidth: 1,
                borderTopColor: "rgba(229, 231, 235, 0.6)",
              }}
            >
              <Text variant="body" color="textSecondary">
                Pas encore de compte ?{" "}
                <Link href="/(auth)/register">
                  <Text color="primary" fontWeight="600">
                    S&apos;inscrire
                  </Text>
                </Link>
              </Text>
            </Box>
          </Box>

          {/* ===== SNACKBAR ===== */}
          <Snack
            visible={snackbarVisible}
            onDismiss={dismissSnack}
            type={snackType}
            message={snackbarMessage}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
}
