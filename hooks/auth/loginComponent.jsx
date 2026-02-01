import { Box, Button, Text } from "@/components/ui/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";

import { loginUser } from "@/components/api/auth.api";
import { Snack } from "../../components/ui/snackbar";
import { loginSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";

export default function LoginComponent() {
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showResetHint, setShowResetHint] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useAuthForm(loginSchema, {
    email: "",
    password: "",
  });

  // Gestion du clic sur le titre pour reset onboarding
  useEffect(() => {
    if (tapCount >= 3 && tapCount < 5) {
      setShowResetHint(true);
      const timer = setTimeout(() => setShowResetHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [tapCount]);

  const handleTitlePress = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount === 5) {
      resetOnboarding();
      setTapCount(0);
    }

    setTimeout(() => {
      if (tapCount > 0) setTapCount(0);
      setShowResetHint(false);
    }, 3000);
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem("@edutrack_onboarding_seen");
      Alert.alert("✅ Onboarding réinitialisé", "Redirection...", [
        { text: "OK", onPress: () => {} },
      ]);
      setTimeout(() => {
        router.replace("/(onboarding)");
      }, 500);
    } catch {
      Alert.alert("❌ Erreur", "Impossible de réinitialiser");
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const userData = await loginUser(data);
      router.replace(`/(tabs)/(${userData.role})`);
    } catch (err) {
      setSnackbarMessage(err.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="background" padding="xl">
      <TouchableOpacity onPress={handleTitlePress}>
        <Box marginBottom="xl">
          <Text variant="hero" color="primary" textAlign="center">
            EduTrack
          </Text>
        </Box>
      </TouchableOpacity>

      {showReset && (
        <Button
          title="Réinitialiser l'onboarding"
          onPress={resetOnboarding}
          variant="secondary"
          marginBottom="m"
        />
      )}

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
      </Box>

      <Box alignItems="center" marginTop="xl">
        <Text variant="body" color="muted">
          Pas encore de compte ?{" "}
          <Link
            href="/(auth)/register"
            style={{ color: "#2563EB", fontWeight: "600" }}
          >
            S'inscrire
          </Link>
        </Text>
      </Box>

      {/* Snackbar pour les erreurs */}
      <Snack
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        style={{ backgroundColor: "red" }}
      >
        {snackbarMessage}
      </Snack>
    </Box>
  );
}
