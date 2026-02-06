import { useAuth } from "@/components/constants/authContext";
import { auth } from "@/components/lib/firebase";
import { Box, Button, Text } from "@/components/ui/theme";
import { InputField } from "@/hooks/auth/inputField";
import { router } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { ChevronLeft, Lock, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UniversalSecurityScreen() {
  const { user } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const themeColor =
    user?.role === "trainer"
      ? "secondary"
      : user?.role === "admin"
        ? "primary"
        : "info";

  // --- REACT HOOK FORM ---
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    if (newPassword !== confirmPassword) {
      return alert("Les mots de passe ne correspondent pas.");
    }

    try {
      setLoading(true);
      const firebaseUser = auth.currentUser;

      if (firebaseUser?.email) {
        const credential = EmailAuthProvider.credential(
          firebaseUser.email,
          currentPassword,
        );
        await reauthenticateWithCredential(firebaseUser, credential);
        await updatePassword(firebaseUser, newPassword);

        alert("Mot de passe mis à jour !");
        router.back();
      }
    } catch (error) {
      console.log("Password update error:", error);
      const msg =
        error.code === "auth/wrong-password"
          ? "Ancien mot de passe incorrect."
          : "Erreur lors de la mise à jour.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER NAVIGATION */}
        <Box flexDirection="row" alignItems="center" padding="m" gap="m">
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={24} color="black" />
          </Pressable>
          <Text variant="title">Sécurité</Text>
        </Box>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* ICONE & ROLE */}
          <Box alignItems="center" marginVertical="l">
            <Box
              backgroundColor={themeColor}
              padding="m"
              borderRadius="rounded"
            >
              <ShieldCheck size={40} color="white" />
            </Box>
            <Text variant="body" color="muted" marginTop="s" textAlign="center">
              Compte {user?.role === "trainer" ? "Formateur" : "Apprenant"}
            </Text>
          </Box>

          {/* FORMULAIRE */}
          <Box backgroundColor="white" borderRadius="l" padding="m" gap="m">
            <InputField
              control={control}
              name="currentPassword"
              label="Mot de passe actuel"
              placeholder="••••••••"
              secureTextEntry={!showPass}
              icon={<Lock size={18} color="#6B7280" />}
              error={errors.currentPassword}
              rules={{ required: "Ce champ est obligatoire" }}
            />

            <InputField
              control={control}
              name="newPassword"
              label="Nouveau mot de passe"
              placeholder="••••••••"
              secureTextEntry={!showPass}
              icon={<Lock size={18} color="#6B7280" />}
              error={errors.newPassword}
              rules={{ required: "Ce champ est obligatoire" }}
            />

            <InputField
              control={control}
              name="confirmPassword"
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              secureTextEntry={!showPass}
              icon={<Lock size={18} color="#6B7280" />}
              error={errors.confirmPassword}
              rules={{ required: "Ce champ est obligatoire" }}
            />

            <Button
              title={loading ? "En cours..." : "Enregistrer"}
              onPress={handleSubmit(onSubmit)}
              icon={
                loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Lock size={20} color="white" />
                )
              }
              disabled={loading}
              backgroundColor={themeColor}
            />
          </Box>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
