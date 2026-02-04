import { Box, Button, Text } from "@/components/ui/theme";
import { Link, router } from "expo-router";
import { useState } from "react";

import { loginUser } from "@/components/api/auth.api";
import { Snack } from "@/components/ui/snackbar";
import { loginSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";

export default function LoginComponent() {
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [error, setError] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useAuthForm(loginSchema, {
    email: "",
    password: "",
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userData = await loginUser(data);

      if (!userData) {
        setSnackbarMessage("Erreur lors de la connexion");
        setError(true);
        setSnackbarVisible(true);
        setLoading(false);
        return;
      }

      console.log("✅ User data after login:", userData);
      console.log("🔑 User role:", userData.role);

      setSnackbarMessage("Connexion réussie !");
      setError(false);
      setSnackbarVisible(true);

      // ✅ Redirection selon le rôle avec vos routes
      setTimeout(() => {
        switch (userData.role) {
          case "learner":
            console.log("🎓 Redirecting to learner dashboard...");
            router.replace("/(learner-tabs)");
            break;

          case "trainer":
            console.log("👨‍🏫 Redirecting to trainer dashboard...");
            router.replace("/(trainer-tabs)");
            break;

          case "admin":
            console.log("👑 Redirecting to admin dashboard...");
            router.replace("/(admin-tabs)");
            break;

          default:
            console.warn("⚠️ Unknown role:", userData.role);
            setSnackbarMessage("Rôle utilisateur inconnu");
            setError(true);
            setSnackbarVisible(true);
            router.replace("/(auth)/login");
        }
      }, 1000);
    } catch (err) {
      console.error("❌ Login error:", err);
      setSnackbarMessage(err.message || "Erreur de connexion");
      setError(true);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="background" padding="xl">
      <Box marginBottom="xl">
        <Text variant="hero" color="primary" textAlign="center">
          EduTrack
        </Text>
      </Box>

      <Text variant="title" textAlign="center" marginBottom="s">
        Connexion
      </Text>

      <Box gap="m">
        <InputField
          control={control}
          name="email"
          label="Email"
          placeholder="email@exemple.com"
          keyboardType="email-address"
          error={errors.email}
        />
        <InputField
          control={control}
          name="password"
          label="Mot de passe"
          placeholder="Votre mot de passe"
          secureTextEntry
          error={errors.password}
        />

        <Button
          title={loading ? "Connexion..." : "Se connecter"}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || loading}
          marginTop="m"
        />
        <Box alignItems="flex-end" marginTop="s">
          <Link
            href="/(auth)/forgotPassword"
            style={{ color: "#2563EB", fontWeight: "600" }}
          >
            Mot de passe oublié ?
          </Link>
        </Box>
      </Box>

      <Box alignItems="center" marginTop="xl">
        <Text variant="body" color="muted">
          Pas encore de compte ?{" "}
          <Link
            href="/(auth)/register"
            style={{ color: "#2563EB", fontWeight: "600" }}
          >
            S&apos;inscrire
          </Link>
        </Text>
      </Box>

      {/* Snackbar pour les erreurs */}
      <Snack
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        error={error}
        style={{ backgroundColor: "red" }}
      >
        {snackbarMessage}
      </Snack>
    </Box>
  );
}
