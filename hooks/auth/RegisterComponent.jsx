// RegisterComponent.tsx (version mise à jour)
import { EmailValidationModal } from "@/components/modal/confirmeEmail";
import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { Link } from "expo-router";
import {
  ArrowRight,
  GraduationCap,
  Lock,
  Mail,
  Ticket,
  User,
  UserPlus,
  Users,
} from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRegister } from "../useRegister";
import { registerSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";
import { SelectField } from "./selectField";

export default function RegisterComponent() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
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
    fullName: "",
    email: "",
    password: "",
    role: "",
    invitationCode: "",
  });

  const {
    loading,
    snackbarVisible,
    snackbarMessage,
    openModal,
    error,
    email,
    setSnackbarVisible,
    setOpenModal,
    onSubmit,
  } = useRegister(reset);

  const selectedRole = watch("role");

  return (
    <Box flex={1} backgroundColor="primary">
      {/* ===== WAVE BACKGROUND ===== */}
      {/* <WaveBackground
        primaryColor="#2563EB"
        secondaryColor="#1D4ED8"
        variant="register"
      /> */}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Box flex={1} padding="xl" justifyContent="center">
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* ===== HEADER ===== */}
              <Box alignItems="center" marginBottom="l">
                <Box
                  backgroundColor="infoBackground"
                  padding="m"
                  borderRadius="rounded"
                  marginBottom="m"
                >
                  <UserPlus size={32} color="white" />
                </Box>
                <Text variant="hero" color="white">
                  EduTrack
                </Text>
                <Text
                  variant="title"
                  marginTop="xs"
                  textAlign="center"
                  color="white"
                >
                  Créer un compte
                </Text>
                <Text
                  variant="body"
                  color="overlayLight"
                  textAlign="center"
                  marginTop="xs"
                >
                  La plateforme de suivi pour formateurs et apprenants
                </Text>
              </Box>

              {/* ===== FORMULAIRE ===== */}
              <Box gap="m">
                <InputField
                  control={control}
                  name="fullName"
                  label="Nom complet"
                  placeholder="Ex: Jean Dupont"
                  error={errors.fullName}
                  icon={<User size={20} color="#6B7280" />}
                />

                <InputField
                  control={control}
                  name="email"
                  label="Email professionnel"
                  placeholder="jean.dupont@email.com"
                  keyboardType="email-address"
                  error={errors.email}
                  icon={<Mail size={20} color="#6B7280" />}
                />

                <InputField
                  control={control}
                  name="password"
                  label="Mot de passe"
                  placeholder="6 caractères minimum"
                  secureTextEntry
                  error={errors.password}
                  icon={<Lock size={20} color="#6B7280" />}
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

                {/* Animation simple pour le champ conditionnel */}
                {selectedRole === "learner" && (
                  <Box>
                    <InputField
                      control={control}
                      name="invitationCode"
                      label="Code d'invitation"
                      placeholder="Entrez le code de votre formation"
                      error={errors.invitationCode}
                      icon={<Ticket size={20} color="#2563EB" />}
                    />
                    <Text
                      variant="caption"
                      color="overlayLight"
                      marginLeft="s"
                      marginTop="xs"
                    >
                      Requis pour rejoindre une session active.
                    </Text>
                  </Box>
                )}

                <Button
                  title={
                    loading ? "Traitement en cours..." : "Créer mon compte"
                  }
                  onPress={handleSubmit(onSubmit)}
                  disabled={!isValid || loading}
                  variant="secondary"
                  marginTop="l"
                  icon={<ArrowRight size={20} color="white" />}
                />
              </Box>

              {/* ===== FOOTER ===== */}
              <Box alignItems="center" marginTop="xl" marginBottom="l">
                <Text variant="body" color="overlayLight">
                  Déjà membre ?{" "}
                  <Link href="/(auth)/login">
                    <Text color="white" fontWeight="700">
                      Se connecter
                    </Text>
                  </Link>
                </Text>
              </Box>

              {/* ===== FEEDBACK & MODALS ===== */}
              <Snack
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                type={error ? "error" : "success"}
                message={snackbarMessage}
              />

              {openModal && (
                <EmailValidationModal
                  visible={openModal}
                  onClose={() => setOpenModal(false)}
                  email={email}
                />
              )}
            </Animated.View>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
}
