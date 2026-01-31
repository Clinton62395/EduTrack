import { auth, db } from "@/components/lib/firabase";
import { Box, Button, Text } from "@/components/ui/theme";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ← IMPORT CORRECT
import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { loginSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";

export default function LoginComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showResetHint, setShowResetHint] = useState(false);

  // Afficher l'indication de réinitialisation après 3 taps

  useEffect(() => {
    if (tapCount >= 3 && tapCount < 5) {
      setShowResetHint(true);
      const timer = setTimeout(() => setShowResetHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [tapCount]);

  // Réinitialiser l'onboarding ET rediriger
  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem("@edutrack_onboarding_seen");

      // Message court puis redirection
      Alert.alert("✅ Onboarding réinitialisé", "Redirection...", [
        { text: "OK", onPress: () => {} },
      ]);

      // Redirection immédiate
      setTimeout(() => {
        router.replace("/(onboarding)");
      }, 500);
    } catch (err) {
      Alert.alert("❌ Erreur", "Impossible de réinitialiser");
    }
  };

  // Gestion du clic sur le titre
  const handleTitlePress = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount === 5) {
      resetOnboarding();
      setTapCount(0);
    }

    // Reset le compteur après 3 secondes
    setTimeout(() => {
      if (tapCount > 0) setTapCount(0);
      setShowResetHint(false);
    }, 3000);
  };

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
    setError("");

    try {
      // 1. Connexion Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      // 2. Récupérer le rôle depuis Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists()) {
        throw new Error("Utilisateur non trouvé");
      }

      const userData = userDoc.data();

      // 3. Vérifier le statut
      if (userData.status !== "active") {
        throw new Error("Compte en attente d'activation");
      }

      // 4. Redirection selon rôle
      router.replace(`/(tabs)/(${userData.role})`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="background" padding="xl">
      <Box marginBottom="xl">
        {/* Titre cliquable */}
        <TouchableOpacity onPress={handleTitlePress}>
          <Box marginBottom="xl">
            <Text variant="hero" color="primary" textAlign="center">
              EduTrack
            </Text>
            {/* <Text variant="title" textAlign="center" marginTop="s">
              Connexion
            </Text> */}
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

        <Text variant="title" textAlign="center" marginTop="s">
          Connexion
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

        <InputField
          control={control}
          name="password"
          label="Mot de passe"
          placeholder="Votre mot de passe"
          secureTextEntry
          error={errors.password}
        />

        {error && (
          <Box backgroundColor="red" padding="m" borderRadius="m">
            <Text color="white" textAlign="center">
              {error}
            </Text>
          </Box>
        )}

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
    </Box>
  );
}
