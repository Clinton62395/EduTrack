// app/(auth)/_layout.jsx
import { Stack, router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../../components/lib/firabase";

export default function AuthLayout() {
  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Rediriger vers les tabs si déjà connecté
        router.replace("/(tabs)");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
