import { forgotPasswordService } from "@/components/api/auth.api";
import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView } from "react-native";
import { useAuthForm } from "./fromValidator";
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
  } = useAuthForm(
    { email: { required: "Email requis", pattern: /^\S+@\S+\.\S+$/ } },
    { email: "" },
  );

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
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: "#f9fafb" }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          flex: 1,
          paddingHorizontal: 20,
          paddingVertical: 30,
        }}
      >
        <Box marginBottom="l">
          <Text variant="hero" color="primary" textAlign="center">
            EduTrack
          </Text>
          <Text variant="title" textAlign="center" marginTop="s">
            Réinitialiser le mot de passe
          </Text>
        </Box>

        <Box gap="m">
          <InputField
            control={control}
            name="email"
            label="Email"
            placeholder="email@exemple.com"
            keyboardType="email-address"
            error={errors.email}
          />

          <Button
            title={loading ? "Envoi..." : "Envoyer le lien"}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || loading}
            marginTop="m"
          />
        </Box>

        <Box alignItems="center" marginTop="l">
          <Text variant="body" color="muted">
            Retour à la connexion ?{" "}
            <Link
              href="/(auth)/login"
              style={{ color: "#2563EB", fontWeight: "600" }}
            >
              Se connecter
            </Link>
          </Text>
        </Box>

        <Snack
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          error={error}
        >
          {snackbarMessage}
        </Snack>
      </Animated.View>
    </ScrollView>
  );
}
