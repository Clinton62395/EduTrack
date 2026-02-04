import { useAuth } from "@/components/constants/authContext";
import { auth } from "@/components/lib/firabase";
import { router } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useState } from "react";
import { Alert } from "react-native";

export function useSecurity() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Couleur dynamique selon le rôle
  const themeColor =
    user?.role === "trainer"
      ? "secondary"
      : user?.role === "admin"
        ? "primary"
        : "info";

  // Fonction pour changer le mot de passe
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Erreur", "Tous les champs sont obligatoires.");
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
    }

    const firebaseUser = auth.currentUser;

    if (!firebaseUser?.email) {
      return Alert.alert(
        "Erreur",
        "Utilisateur non connecté ou email introuvable.",
      );
    }

    try {
      setLoading(true);

      // Réauthentification
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword,
      );
      await reauthenticateWithCredential(firebaseUser, credential);

      // Mise à jour du mot de passe
      await updatePassword(firebaseUser, newPassword);

      Alert.alert("Succès", "Mot de passe mis à jour.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.log("Password update error:", error);

      let msg = "Erreur lors de la mise à jour.";
      if (error.code === "auth/wrong-password") {
        msg = "Ancien mot de passe incorrect.";
      } else if (error.code === "auth/weak-password") {
        msg = "Le nouveau mot de passe est trop faible.";
      }

      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    themeColor,
    handleChangePassword,
  };
}
