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
  User,
  UserPlus,
  Users,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Controller, useWatch } from "react-hook-form"; // Ajout de Controller
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { RoleOption } from "../../components/helpers/userRole.helper";
import EliteWaveBackground from "../../components/ui/waveBackground";
import { useRegister } from "../useRegister";
import { registerSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";

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
    reset,
    formState: { errors, isValid },
  } = useAuthForm(registerSchema, {
    fullName: "",
    email: "",
    password: "",
    role: "learner",
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

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  return (
    <View style={{ flex: 1 }}>
      <EliteWaveBackground primaryColor="#2563EB" secondaryColor="#1D4ED8" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.cardContainer}>
              <View style={styles.cardOverlay} />

              <Box padding="xl">
                {/* HEADER */}
                <Box alignItems="center" marginBottom="l">
                  <Box style={styles.iconHeader}>
                    <UserPlus size={36} color="#2563EB" />
                  </Box>
                  <Text variant="hero" color="primary" textAlign="center">
                    EduTrack
                  </Text>
                  <Text variant="title" marginTop="xs" textAlign="center">
                    Créer un compte
                  </Text>
                </Box>

                {/* FORMULAIRE */}
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
                        style={styles.eyeBtn}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="#6B7280" />
                        ) : (
                          <Eye size={20} color="#6B7280" />
                        )}
                      </TouchableOpacity>
                    )}
                  </Box>

                  {/* ===== RADIO BUTTONS POUR LE RÔLE ===== */}
                  <Box marginTop="s">
                    <Text
                      variant="caption"
                      color="textSecondary"
                      marginBottom="s"
                      marginLeft="xs"
                      fontWeight="700"
                      fontSize={18}
                    >
                      Vous etes :
                    </Text>

                    {/* ===== RADIO BUTTONS POUR LE RÔLE ===== */}
                    <Controller
                      control={control}
                      name="role"
                      render={({ field: { value, onChange } }) => (
                        <Box
                          flexDirection="row"
                          width="100%"
                          justifyContent="center"
                          gap="s"
                          alignItems="center"
                        >
                          <RoleOption
                            label="Apprenant"
                            value="learner"
                            currentRole={value}
                            onSelect={onChange}
                            icon={
                              <GraduationCap
                                size={18}
                                color={
                                  value === "learner" ? "#2563EB" : "#6B7280"
                                }
                              />
                            }
                          />
                          <RoleOption
                            label="Formateur"
                            value="trainer"
                            currentRole={value}
                            onSelect={onChange}
                            icon={
                              <Users
                                size={18}
                                color={
                                  value === "trainer" ? "#2563EB" : "#6B7280"
                                }
                              />
                            }
                          />
                        </Box>
                      )}
                    />
                    {errors.role && (
                      <Text color="error" variant="caption">
                        {errors.role.message}
                      </Text>
                    )}
                  </Box>

                  <Button
                    title={loading ? "Traitement..." : "Créer mon compte"}
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid || loading}
                    variant="primary"
                    loading={loading}
                    marginTop="l"
                    icon={<ArrowRight size={20} color="white" />}
                  />
                </Box>

                {/* FOOTER */}
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  cardContainer: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "white",
    elevation: 10,
    shadowColor: "#2563EB",
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  iconHeader: {
    padding: 16,
    borderRadius: 50,
    backgroundColor: "white",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.1)",
  },
  input: {
    backgroundColor: "white",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 45,
  },

  footerContainer: {
    alignItems: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(229, 231, 235, 0.6)",
  },
});
