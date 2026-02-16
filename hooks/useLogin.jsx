import { loginUser } from "@/components/api/auth.api";
import { router } from "expo-router";
import { useState } from "react";

export function useLogin() {
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackType, setSnackType] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [error, setError] = useState(false);

  const showSnack = (message, type = "success") => {
    setSnackbarMessage(message);
    setSnackType(type);
    setSnackbarVisible(true);
  };

  const dismissSnack = () => {
    setSnackbarVisible(false);
  };

  const onSubmit = async (data) => {
    setError(false); // On reset l'erreur au début
    try {
      const userData = await loginUser(data);

      if (!userData) {
        showSnack("Identifiants incorrects ou compte inexistant", "error");
        setError(true);
        return;
      }

      showSnack("Connexion réussie !", "success");

      // Redirection selon le rôle
      setTimeout(() => {
        switch (userData.role) {
          case "learner":
            router.replace("/(learner-tabs)");
            break;
          case "trainer":
            router.replace("/(trainer-tabs)");
            break;
          case "admin":
            router.replace("/(admin-tabs)");
            break;
          default:
            showSnack("Rôle utilisateur non reconnu", "error");
            setError(true);
        }
      }, 1500); // Un peu plus de temps pour laisser lire le snack de succès
    } catch (err) {
      console.error(err);
      showSnack(err.message || "Une erreur est survenue", "error");
      setError(true);
    }
    // ❌ SURTOUT PAS DE setSnackbarVisible(false) ICI
  };

  return {
    snackbarVisible,
    snackbarMessage,
    snackType,
    dismissSnack,
    error,
    onSubmit,
  };
}
