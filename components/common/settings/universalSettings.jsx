import { useAuth } from "@/components/constants/authContext";
import { auth } from "@/components/lib/firebase";
import { InputField } from "@/hooks/auth/inputField";
import { router } from "expo-router";
// using auth instance for provider/reauthentication functions
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ms } from "../../ui/theme";

export default function UniversalSecurityScreen() {
  const { user } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }

  const isTrainer = user?.role === "trainer";

  const {
    control,
    handleSubmit,
    reset,
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
      setFeedback({
        type: "error",
        message: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setFeedback({
        type: "error",
        message: "Le mot de passe doit contenir au moins 6 caractères.",
      });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      const firebaseUser = auth.currentUser;

      if (firebaseUser?.email) {
        const credential = auth.EmailAuthProvider.credential(
          firebaseUser.email,
          currentPassword,
        );
        await firebaseUser.reauthenticateWithCredential(credential);
        await firebaseUser.updatePassword(newPassword);
        setFeedback({
          type: "success",
          message: "Mot de passe mis à jour avec succès !",
        });
        reset();
      }
    } catch (error) {
      const msg =
        error.code === "auth/wrong-password"
          ? "Ancien mot de passe incorrect."
          : error.code === "auth/too-many-requests"
            ? "Trop de tentatives. Réessayez plus tard."
            : "Erreur lors de la mise à jour.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ChevronLeft size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sécurité</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* HERO */}
          <View style={styles.hero}>
            <View
              style={[
                styles.heroIconOuter,
                { backgroundColor: isTrainer ? "#FFF7ED" : "#EFF6FF" },
              ]}
            >
              <View
                style={[
                  styles.heroIconInner,
                  { backgroundColor: isTrainer ? "#FFEDD5" : "#DBEAFE" },
                ]}
              >
                <ShieldCheck
                  size={28}
                  color={isTrainer ? "#EA580C" : "#2563EB"}
                />
              </View>
              <View
                style={[
                  styles.heroRing,
                  {
                    borderColor: isTrainer
                      ? "rgba(234,88,12,0.15)"
                      : "rgba(37,99,235,0.15)",
                  },
                ]}
              />
            </View>
            <Text style={styles.heroTitle}>Changer le mot de passe</Text>
            <Text style={styles.heroSub}>
              Compte {isTrainer ? "Formateur" : "Apprenant"} · {user?.email}
            </Text>
          </View>

          {/* FEEDBACK BANNER */}
          {feedback && (
            <View
              style={[
                styles.feedback,
                feedback.type === "success"
                  ? styles.feedbackSuccess
                  : styles.feedbackError,
              ]}
            >
              <Text
                style={[
                  styles.feedbackText,
                  feedback.type === "success"
                    ? styles.feedbackTextSuccess
                    : styles.feedbackTextError,
                ]}
              >
                {feedback.type === "success" ? "✓  " : "⚠  "}
                {feedback.message}
              </Text>
            </View>
          )}

          {/* FORM CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Lock size={16} color="#64748B" />
              <Text style={styles.cardHeaderText}>
                Modifier le mot de passe
              </Text>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.formFields}>
              <InputField
                control={control}
                name="currentPassword"
                label="Mot de passe actuel"
                placeholder="••••••••"
                secureTextEntry={!showPass}
                icon={<Lock size={16} color="#9CA3AF" />}
                error={errors.currentPassword}
                rules={{ required: "Ce champ est obligatoire" }}
              />

              <InputField
                control={control}
                name="newPassword"
                label="Nouveau mot de passe"
                placeholder="••••••••"
                secureTextEntry={!showPass}
                icon={<Lock size={16} color="#9CA3AF" />}
                error={errors.newPassword}
                rules={{
                  required: "Ce champ est obligatoire",
                  minLength: { value: 6, message: "Minimum 6 caractères" },
                }}
              />

              <InputField
                control={control}
                name="confirmPassword"
                label="Confirmer le nouveau mot de passe"
                placeholder="••••••••"
                secureTextEntry={!showPass}
                icon={<Lock size={16} color="#9CA3AF" />}
                error={errors.confirmPassword}
                rules={{ required: "Ce champ est obligatoire" }}
              />
            </View>

            {/* Show/hide password toggle */}
            <TouchableOpacity
              onPress={() => setShowPass(!showPass)}
              style={styles.showPassBtn}
              activeOpacity={0.7}
            >
              {showPass ? (
                <EyeOff size={15} color="#64748B" />
              ) : (
                <Eye size={15} color="#64748B" />
              )}
              <Text style={styles.showPassText}>
                {showPass ? "Masquer" : "Afficher"} les mots de passe
              </Text>
            </TouchableOpacity>
          </View>

          {/* TIPS */}
          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>Conseils de sécurité</Text>
            <TipItem text="Utilisez au moins 8 caractères" />
            <TipItem text="Mélangez lettres, chiffres et symboles" />
            <TipItem text="Évitez les mots de passe déjà utilisés" />
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            style={[
              styles.submitBtn,
              { backgroundColor: isTrainer ? "#EA580C" : "#2563EB" },
              loading && styles.submitBtnDisabled,
            ]}
            activeOpacity={0.85}
          >
            {loading ? (
              <Text style={styles.submitBtnText}>Mise à jour en cours...</Text>
            ) : (
              <>
                <ShieldCheck
                  size={18}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.submitBtnText}>
                  Mettre à jour le mot de passe
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 TIP ITEM
// ─────────────────────────────────────────
function TipItem({ text }) {
  return (
    <View style={styles.tipRow}>
      <View style={styles.tipDot} />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

// ─────────────────────────────────────────
// 🎨 STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scroll: {
    padding: ms(20),
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: ms(16),
    paddingVertical: ms(12),
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: ms(8),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: 2 },
    }),
  },
  backBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(10),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: ms(17),
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  // HERO
  hero: {
    alignItems: "center",
    paddingVertical: ms(28),
  },
  heroIconOuter: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(24),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: ms(16),
    position: "relative",
  },
  heroIconInner: {
    width: ms(64),
    height: ms(64),
    borderRadius: ms(20),
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: ms(12),
        shadowOffset: { width: 0, height: ms(4) },
      },
      android: { elevation: 3 },
    }),
  },
  heroRing: {
    position: "absolute",
    width: ms(80),
    height: ms(80),
    borderRadius: ms(24),
    borderWidth: ms(1),
  },
  heroTitle: {
    fontSize: ms(20),
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
    marginBottom: ms(6),
  },
  heroSub: {
    fontSize: ms(13),
    color: "#64748B",
    textAlign: "center",
  },

  // FEEDBACK
  feedback: {
    borderRadius: ms(12),
    padding: ms(14),
    marginBottom: ms(16),
    borderWidth: ms(1),
  },
  feedbackSuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  feedbackError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  feedbackText: {
    fontSize: ms(13),
    fontWeight: "500",
    lineHeight: ms(18),
  },
  feedbackTextSuccess: {
    color: "#065F46",
  },
  feedbackTextError: {
    color: "#991B1B",
  },

  // CARD
  card: {
    backgroundColor: "white",
    borderRadius: ms(16),
    overflow: "hidden",
    marginBottom: ms(16),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: ms(10),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(8),
    padding: ms(16),
  },
  cardHeaderText: {
    fontSize: ms(13),
    fontWeight: "600",
    color: "#64748B",
  },
  cardDivider: {
    height: ms(1),
    backgroundColor: "#F1F5F9",
  },
  formFields: {
    padding: ms(16),
    gap: ms(16),
  },

  // SHOW PASS
  showPassBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
    paddingHorizontal: ms(16),
    paddingBottom: ms(16),
  },
  showPassText: {
    fontSize: ms(12),
    color: "#64748B",
    fontWeight: "500",
  },

  // TIPS
  tips: {
    backgroundColor: "white",
    borderRadius: ms(16),
    padding: ms(16),
    marginBottom: ms(20),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: ms(8),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: 1 },
    }),
  },
  tipsTitle: {
    fontSize: ms(12),
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: ms(0.8),
    marginBottom: ms(12),
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(10),
    marginBottom: ms(8),
  },
  tipDot: {
    width: ms(5),
    height: ms(5),
    borderRadius: ms(3),
    backgroundColor: "#CBD5E1",
  },
  tipText: {
    fontSize: ms(13),
    color: "#475569",
    fontWeight: "400",
  },

  // SUBMIT
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ms(15),
    borderRadius: ms(14),
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOpacity: 0.3,
        shadowRadius: ms(10),
        shadowOffset: { width: 0, height: ms(4) },
      },
      android: { elevation: 4 },
    }),
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "white",
    fontSize: ms(15),
    fontWeight: "700",
    letterSpacing: ms(0.2),
  },
});
