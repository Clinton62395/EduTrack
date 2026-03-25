import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EliteWaveBackground from "../../components/ui/waveBackground";
import { useLogin } from "../useLogin";
import { loginSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";

// Import du logo pour éviter les problèmes en production
const logoImage = require("../../assets/images/logo.png");

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(true);

  // Animation subtile du logo au montage
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
    snackbarVisible,
    snackbarMessage,
    onSubmit,
    dismissSnack,
    snackType,
  } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting: loading },
  } = useAuthForm(loginSchema, { email: "", password: "" });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  return (
    <View style={s.root}>
      {/* ── FOND SOMBRE + VAGUES ── */}
      <View style={s.bgDark} />
      <EliteWaveBackground
        primaryColor="#2563EB"
        secondaryColor="#1D4ED8"
        tertiaryColor="#3B82F6"
      />

      {/* Lueurs décoratives */}
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── LOGO + TITRE ── */}
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
            {/* Logo */}
            <View style={s.logoBox}>
              <View style={s.logoRing} />
              <View style={s.logoInner}>
                <Box style={s.logowrapper}>
                  {/* logo */}
                  <Image
                    source={logoImage}
                    contentFit="cover"
                    style={s.logoImage}
                  />
                </Box>
              </View>
            </View>

            <Text style={s.appName}>EduTrack</Text>
            <Text style={s.appTagline}>Formez · Progressez · Certifiez</Text>
          </Animated.View>

          {/* ── CARD GLASSMORPHISME ── */}
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
            {/* Ligne supérieure colorée */}
            <View style={s.cardAccent} />

            {/* En-tête card */}
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>Connexion</Text>
              <Text style={s.cardSub}>Accédez à votre espace personnel</Text>
            </View>

            {/* Champs */}
            <View style={s.fields}>
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
                  placeholder="••••••••"
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

                <View style={s.forgotRow}>
                  <Link href="/(auth)/forgotPassword">
                    <Text style={s.forgotText}>Mot de passe oublié ?</Text>
                  </Link>
                </View>
              </View>
            </View>

            {/* Bouton connexion */}
            <Button
              title={loading ? "Connexion..." : "Se connecter"}
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              disabled={!isValid || loading}
              variant="primary"
              icon={<ArrowRight size={18} color="white" />}
              iconPosition="right"
              style={s.submitBtn}
            />

            {/* Séparateur + inscription */}
            <View style={s.footer}>
              <View style={s.footerLine} />
              <Text style={s.footerText}>Pas encore de compte ?</Text>
              <View style={s.footerLine} />
            </View>

            <Link href="/(auth)/register" asChild>
              <Pressable style={s.registerBtn}>
                <Text style={s.registerBtnText}>Créer un compte</Text>
              </Pressable>
            </Link>
          </Animated.View>

          {/* Badge sécurité */}
          <View style={s.securityBadge}>
            <View style={s.securityDot} />
            <Text style={s.securityText}>Connexion sécurisée et fiable</Text>
          </View>

          {/* Texte supplémentaire */}
          <Text style={s.additionalText}>
            Accédez à votre compte en toute sécurité.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snack
        visible={snackbarVisible}
        onDismiss={dismissSnack}
        type={snackType}
        message={snackbarMessage}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  // Fond
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
    top: -100,
    left: -80,
  },
  glow2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#7C3AED",
    opacity: 0.08,
    bottom: 50,
    right: -60,
  },
  logowrapper: {
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

  // Scroll
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 20,
  },

  // Logo section
  logoSection: {
    alignItems: "center",
    gap: 8,
  },
  logoBox: {
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    position: "relative",
  },
  logoRing: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.3)",
  },
  logoInner: { justifyContent: "center", alignItems: "center" },
  appName: {
    fontSize: 32,
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
  cardHeader: { marginBottom: 20 },
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
  },

  // Champs
  fields: { gap: 16, marginBottom: 20 },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 42,
  },
  forgotRow: { alignItems: "flex-end", marginTop: 6 },
  forgotText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#60A5FA",
  },

  // Bouton
  submitBtn: {
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
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
  },
  registerBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  registerBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },

  // Badge sécurité
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
