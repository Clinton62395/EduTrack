import { registerUser } from "@/components/api/auth.api";
import { verifyInvitationCode } from "@/components/api/verificationCode.api";
import { EmailValidationModal } from "@/components/modal/confirmeEmail";
import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { Link } from "expo-router";
import { GraduationCap, Users } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView } from "react-native";
import { registerSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";
import { SelectField } from "./selectField";
export default function RegisterComponent() {
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
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
    watch,
    reset,
    formState: { errors, isValid },
  } = useAuthForm(registerSchema, {
    role: "",
    invitationCode: "",
  });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    setError(false);
    setLoading(true);

    try {
      if (data.role === "learner") {
        const { formationId, trainerId } = await verifyInvitationCode(
          data.invitationCode,
        );
        data.formationId = formationId;
        data.trainerId = trainerId;
      }

      await registerUser(data);
      console.log("user role", data.role);
      setSnackbarMessage("Compte créé avec succès !");
      setSnackbarVisible(true);
      setOpenModal(true);
      setEmail(data.email);
      reset();
    } catch (err) {
      console.error(" registeration error", err);
      setError(true);
      setSnackbarMessage(err.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
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
            Créer un compte
          </Text>
        </Box>

        <Box gap="m">
          <InputField
            control={control}
            name="fullName"
            label="Nom complet"
            placeholder="Votre nom"
            error={errors.fullName}
          />
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
            placeholder="Minimum 6 caractères"
            secureTextEntry
            error={errors.password}
          />

          <SelectField
            control={control}
            name="role"
            label="Vous êtes :"
            options={[
              {
                label: "Apprenant",
                value: "learner",
                icon: <GraduationCap size={20} color="#2563EB" />,
              },
              {
                label: "Formateur",
                value: "trainer",
                icon: <Users size={20} color="#2563EB" />,
              },
            ]}
            error={errors.role}
          />

          {selectedRole === "learner" && (
            <InputField
              control={control}
              name="invitationCode"
              label="Code d'invitation"
              placeholder="Obtenez-le auprès de votre formateur"
              error={errors.invitationCode}
            />
          )}

          <Button
            title={loading ? "Création..." : "S'inscrire"}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || loading}
            marginTop="m"
          />
        </Box>

        <Box alignItems="center" marginTop="l">
          <Text variant="body" color="muted">
            Déjà un compte ?{" "}
            <Link
              href="/(auth)/login"
              style={{ color: "#2563EB", fontWeight: "600" }}
            >
              Se connecter
            </Link>
          </Text>
        </Box>

        {/* snackbar */}
        <Snack
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          error={error}
        >
          {snackbarMessage}
        </Snack>

        {/* Modal de confirmation */}
        {openModal && (
          <EmailValidationModal
            visible={openModal}
            onClose={() => setOpenModal(false)}
            email={email}
          />
        )}
      </Animated.View>
    </ScrollView>
  );
}
