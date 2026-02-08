import { EmailValidationModal } from "@/components/modal/confirmeEmail";
import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { Link } from "expo-router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Ticket,
  User,
  UserPlus,
  Users,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import EliteWaveBackground from "../../components/ui/waveBackground";
import { useRegister } from "../useRegister";
import { registerSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";
import { SelectField } from "./selectField";

export default function RegisterComponent() {
  const [showPassword, setShowPassword] = useState(true);
  const handleTogglePassword = () => setShowPassword((prev) => !prev);
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
  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  return (
    <View style={{ flex: 1 }}>
      {/* ===== WAVE BACKGROUND ===== */}
      <EliteWaveBackground primaryColor="#2563EB" secondaryColor="#1D4ED8" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ backgroundColor: "transparent" }}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* ===== CARD ===== */}
            <View style={styles.cardContainer}>
              <View style={styles.cardOverlay} />

              <Box padding="xl">
                {/* ===== HEADER ===== */}
                <Box alignItems="center" marginBottom="l">
                  <Box
                    padding="l"
                    borderRadius="rounded"
                    marginBottom="m"
                    style={{
                      shadowColor: "#2563EB",
                      shadowOpacity: 0.2,
                      shadowRadius: 15,
                      elevation: 5,
                      borderWidth: 1,
                      borderColor: "rgba(37, 99, 235, 0.1)",
                    }}
                  >
                    <UserPlus size={36} color="#2563EB" />
                  </Box>

                  <Text variant="hero" color="primary" textAlign="center">
                    EduTrack
                  </Text>

                  <Text
                    variant="title"
                    marginTop="xs"
                    textAlign="center"
                    style={{ color: "#0F172A" }}
                  >
                    Créer un compte
                  </Text>

                  <Text
                    variant="body"
                    color="textSecondary"
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
                    style={styles.input}
                  />

                  <InputField
                    control={control}
                    name="email"
                    label="Email professionnel"
                    placeholder="jean.dupont@email.com"
                    keyboardType="email-address"
                    error={errors.email}
                    icon={<Mail size={20} color="#6B7280" />}
                    style={styles.input}
                  />

                  <Box>
                    <InputField
                      control={control}
                      name="password"
                      label="Mot de passe"
                      placeholder="6 caractères minimum"
                      secureTextEntry={showPassword}
                      error={errors.password}
                      icon={<Lock size={20} color="#6B7280" />}
                      style={styles.input}
                    />
                    {passwordValue.length > 0 && (
                      <TouchableOpacity
                        onPress={handleTogglePassword}
                        activeOpacity={0.7}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: 44,
                        }}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="#6B7280" />
                        ) : (
                          <Eye size={20} color="#6B7280" />
                        )}
                      </TouchableOpacity>
                    )}
                  </Box>

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
                        style={styles.input}
                      />
                      <Text
                        variant="caption"
                        color="textSecondary"
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
                    variant="primary"
                    marginTop="l"
                    icon={<ArrowRight size={20} color="white" />}
                  />
                </Box>

                {/* ===== FOOTER ===== */}
                <View style={styles.footerContainer}>
                  <Text variant="body" color="textSecondary">
                    Déjà membre ?{" "}
                    <Link href="/(auth)/login">
                      <Text color="primary" fontWeight="600">
                        Se connecter
                      </Text>
                    </Link>
                  </Text>
                </View>

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
              </Box>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#2563EB",
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 24,
  },
  iconContainer: {
    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.1)",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(229, 231, 235, 0.6)",
  },
  input: {
    backgroundColor: "white",
    borderColor: "rgba(229, 231, 235, 0.8)",
  },
});
