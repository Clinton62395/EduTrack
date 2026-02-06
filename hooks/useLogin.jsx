import { loginUser } from "@/components/api/auth.api";
import { router } from "expo-router";
import { useState } from "react";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [error, setError] = useState(false);

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

      setSnackbarMessage("Connexion réussie !");
      setError(false);
      setSnackbarVisible(true);

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
            setSnackbarMessage("Rôle utilisateur inconnu");
            setError(true);
            setSnackbarVisible(true);
            router.replace("/(auth)/login");
        }
      }, 1000);
    } catch (err) {
      setSnackbarMessage(err.message || "Erreur de connexion");
      setError(true);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    snackbarVisible,
    snackbarMessage,
    error,
    setSnackbarVisible,
    onSubmit,
  };
}
