import { EmailValidationModal } from "@/components/modal/confirmeEmail";
import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { Image } from "expo-image";
import { Link } from "expo-router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  User,
  Users,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { RoleOption } from "../../components/helpers/userRole.helper";
import WaveBackground from "../../components/ui/waveBackground";
import { useRegister } from "../useRegister";
import { registerSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";

// Import du logo pour éviter les problèmes en production
const logoImage = require("../../assets/images/logo.png");

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(true);

  // Animations d'entrée — cohérentes avec LoginScreen
  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(logoAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
      Animated.spring(cardAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }),
    ]).start();
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
    <SafeAreaView style={s.root}>
      {/* ── FOND SOMBRE ── */}
      <View style={s.bgDark} />
      <WaveBackground
        primaryColor="#2563EB"
        secondaryColor="#1D4ED8"
        tertiaryColor="#3B82F6"
      />

      {/* Lueurs */}
      <View style={s.glow1} />
      <View style={s.glow2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── LOGO ── */}
          <Animated.View
            style={[
              s.logoSection,
              {
                opacity: logoAnim,
                transform: [
                  {
                    translateY: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Box style={s.logoWrap}>
              <Image
                source={logoImage}
                style={s.logoImage}
                contentFit="cover"
              />
            </Box>
            <Text style={s.appName}>EduTrack</Text>
            <Text style={s.appTagline}>Rejoignez la plateforme</Text>
          </Animated.View>

          {/* ── CARD ── */}
          <Animated.View
            style={[
              s.card,
              {
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Ligne accent */}
            <View style={s.cardAccent} />

            <Text style={s.cardTitle}>Créer un compte</Text>
            <Text style={s.cardSub}>Gratuit · Prêt en quelques secondes</Text>

            {/* ── CHAMPS ── */}
            <View style={s.fields}>
              <InputField
                control={control}
                name="fullName"
                label="Nom complet"
                placeholder="Ex: Mamadou Diallo"
                error={errors.fullName}
                icon={<User size={18} color="#94A3B8" />}
              />

              <InputField
                control={control}
                name="email"
                label="Email"
                placeholder="email@exemple.com"
                keyboardType="email-address"
                error={errors.email}
                icon={<Mail size={18} color="#94A3B8" />}
              />

              <View>
                <InputField
                  control={control}
                  name="password"
                  label="Mot de passe"
                  placeholder="6 caractères minimum"
                  secureTextEntry={showPassword}
                  error={errors.password}
                  icon={<Lock size={18} color="#94A3B8" />}
                />
                {passwordValue.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setShowPassword((p) => !p)}
                    style={s.eyeBtn}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#64748B" />
                    ) : (
                      <Eye size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* ── SÉLECTEUR DE RÔLE ── */}
              <View style={s.roleSection}>
                <Text style={s.roleLabel}>Vous êtes :</Text>
                <Controller
                  control={control}
                  name="role"
                  render={({ field: { value, onChange } }) => (
                    <View style={s.roleRow}>
                      <RoleOption
                        label="Apprenant"
                        value="learner"
                        currentRole={value}
                        onSelect={onChange}
                        icon={
                          <GraduationCap
                            size={18}
                            color={value === "learner" ? "#2563EB" : "#64748B"}
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
                            color={value === "trainer" ? "#2563EB" : "#64748B"}
                          />
                        }
                      />
                    </View>
                  )}
                />
                {errors.role && (
                  <Text style={s.roleError}>{errors.role.message}</Text>
                )}
              </View>
            </View>

            {/* ── BOUTON ── */}
            <Button
              title={loading ? "Création..." : "Créer mon compte"}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || loading}
              variant="primary"
              loading={loading}
              icon={<ArrowRight size={18} color="white" />}
              iconPosition="right"
              style={s.submitBtn}
            />

            {/* ── FOOTER ── */}
            <View style={s.footer}>
              <View style={s.footerLine} />
              <Text style={s.footerText}>Déjà membre ?</Text>
              <View style={s.footerLine} />
            </View>

            <Link href="/(auth)/login" asChild>
              <Pressable style={s.loginBtn}>
                <Text style={s.loginBtnText}>Se connecter</Text>
              </Pressable>
            </Link>
          </Animated.View>

          {/* Badge sécurité */}
          <View style={s.securityBadge}>
            <View style={s.securityDot} />
            <Text style={s.securityText}>
              EduTrack : Apprentissage sécurisé et accessible 24/7
            </Text>
          </View>

          {/* Texte supplémentaire */}
          <Text style={s.additionalText}>
            En vous inscrivant, vous rejoignez une communauté d'apprenants
            passionnés.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  bgDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#070C1F",
  },
  glow1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#2563EB",
    opacity: 0.12,
    top: -80,
    right: -80,
  },
  glow2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#10B981",
    opacity: 0.07,
    bottom: 80,
    left: -60,
  },

  logoWrap: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.2)",
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderColor: "rgba(37,99,235,0.2)",
    objectFit: "cover",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 20,
  },

  // Logo
  logoSection: { alignItems: "center", gap: 6 },
  appName: {
    fontSize: 30,
    fontWeight: "800",
    color: "white",
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // Card
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 18,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 8 },
    }),
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 40,
    right: 40,
    height: 2,
    backgroundColor: "#2563EB",
    borderRadius: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 20,
  },

  // Fields
  fields: { gap: 14 },
  eyeBtn: { position: "absolute", right: 12, top: 42 },

  // Role
  roleSection: { gap: 8 },
  roleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  roleRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch", // Assure que les éléments s'étirent pour avoir la même hauteur
  },
  roleError: { fontSize: 12, color: "#EF4444" },

  // Submit
  submitBtn: {
    marginTop: 20,
    shadowColor: "#2563EB",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    marginBottom: 12,
  },
  footerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  footerText: { fontSize: 12, color: "rgba(255,255,255,0.3)" },
  loginBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },

  // Badge
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  securityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  securityText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 0.3,
  },
  additionalText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 10,
  },
});
