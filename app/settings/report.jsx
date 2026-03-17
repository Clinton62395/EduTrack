import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase";
import { ms } from "@/components/ui/theme";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { router } from "expo-router";
import {
  AlertTriangle,
  Bug,
  ChevronLeft,
  Lightbulb,
  MessageSquare,
  Send,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const APP_VERSION = "1.0.0";

// ─────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────
const REPORT_TYPES = [
  {
    key: "bug",
    label: "Bug / Erreur",
    icon: Bug,
    color: "#DC2626",
    bg: "#FEF2F2",
    desc: "L'app ne fonctionne pas comme prévu",
  },
  {
    key: "suggestion",
    label: "Suggestion",
    icon: Lightbulb,
    color: "#F59E0B",
    bg: "#FFFBEB",
    desc: "Une idée pour améliorer l'app",
  },
  {
    key: "autre",
    label: "Autre",
    icon: MessageSquare,
    color: "#6B7280",
    bg: "#F9FAFB",
    desc: "Autre type de message",
  },
];

const C = {
  primary: "#2563EB",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E5E7EB",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  danger: "#DC2626",
  success: "#16A34A",
};

// ─────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────
export default function ReportScreen() {
  const { user } = useAuth();

  const [selectedType, setSelectedType] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const isValid =
    selectedType && title.trim().length >= 5 && description.trim().length >= 10;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, "bug_reports"), {
        userId: user?.uid || null,
        userName: user?.name || "Anonyme",
        email: user?.email || null,
        role: user?.role || "unknown",
        type: selectedType,
        title: title.trim(),
        description: description.trim(),
        appVersion: APP_VERSION,
        platform: Platform.OS,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Erreur envoi rapport:", err);
      setError("Une erreur est survenue. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  // ── Écran de confirmation ──
  if (submitted) {
    return (
      <View style={s.root}>
        <SafeAreaView style={s.flex}>
          <Header />
          <View style={s.successWrap}>
            <View style={s.successIcon}>
              <Send size={32} color={C.primary} />
            </View>
            <Text style={s.successTitle}>Rapport envoyé !</Text>
            <Text style={s.successText}>
              Merci pour votre retour. Nous l'examinerons dans les plus brefs
              délais.
            </Text>
            <TouchableOpacity
              style={s.successBtn}
              onPress={() => router.back()}
            >
              <Text style={s.successBtnText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <SafeAreaView style={s.flex}>
        <Header />
        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Intro ── */}
            <View style={s.introCard}>
              <AlertTriangle size={16} color={C.primary} />
              <Text style={s.introText}>
                Votre rapport est directement transmis à l'équipe EduTrack.
                Soyez le plus précis possible.
              </Text>
            </View>

            {/* ── Type de rapport ── */}
            <Text style={s.fieldLabel}>Type de rapport *</Text>
            <View style={s.typesRow}>
              {REPORT_TYPES.map((type) => (
                <TypeCard
                  key={type.key}
                  type={type}
                  selected={selectedType === type.key}
                  onPress={() => setSelectedType(type.key)}
                />
              ))}
            </View>

            {/* ── Titre ── */}
            <Text style={s.fieldLabel}>Titre *</Text>
            <TextInput
              style={s.input}
              placeholder="Ex: Le bouton Publier ne répond pas"
              placeholderTextColor={C.muted}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              returnKeyType="next"
            />
            <Text style={s.charCount}>{title.length}/80</Text>

            {/* ── Description ── */}
            <Text style={s.fieldLabel}>Description *</Text>
            <TextInput
              style={[s.input, s.textarea]}
              placeholder="Décrivez le problème en détail. Quand survient-il ? Quelles étapes pour le reproduire ?"
              placeholderTextColor={C.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={s.charCount}>{description.length}/500</Text>

            {/* ── Infos auto ── */}
            <View style={s.autoInfoCard}>
              <Text style={s.autoInfoTitle}>
                Informations jointes automatiquement
              </Text>
              <View style={s.autoInfoRow}>
                <Text style={s.autoInfoKey}>Utilisateur</Text>
                <Text style={s.autoInfoValue}>{user?.name || "Anonyme"}</Text>
              </View>
              <View style={s.autoInfoRow}>
                <Text style={s.autoInfoKey}>Rôle</Text>
                <Text style={s.autoInfoValue}>{user?.role || "—"}</Text>
              </View>
              <View style={s.autoInfoRow}>
                <Text style={s.autoInfoKey}>Version</Text>
                <Text style={s.autoInfoValue}>{APP_VERSION}</Text>
              </View>
              <View style={s.autoInfoRow}>
                <Text style={s.autoInfoKey}>Plateforme</Text>
                <Text style={s.autoInfoValue}>{Platform.OS}</Text>
              </View>
            </View>

            {/* ── Erreur ── */}
            {error && (
              <View style={s.errorCard}>
                <AlertTriangle size={14} color={C.danger} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* ── Bouton Submit ── */}
          <View style={s.footer}>
            <TouchableOpacity
              style={[s.submitBtn, !isValid && s.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!isValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Send size={18} color="white" />
                  <Text style={s.submitBtnText}>Envoyer le rapport</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────
function Header() {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
        <ChevronLeft size={22} color={C.text} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Signaler un problème</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

// ─────────────────────────────────────────
// TYPE CARD
// ─────────────────────────────────────────
function TypeCard({ type, selected, onPress }) {
  const Icon = type.icon;
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.typeCard,
        selected && { borderColor: type.color, backgroundColor: type.bg },
      ]}
    >
      <View
        style={[
          s.typeIconBox,
          { backgroundColor: selected ? type.bg : "#F1F5F9" },
        ]}
      >
        <Icon size={18} color={selected ? type.color : C.muted} />
      </View>
      <Text
        style={[
          s.typeLabel,
          selected && { color: type.color, fontWeight: "700" },
        ]}
      >
        {type.label}
      </Text>
      <Text style={s.typeDesc} numberOfLines={2}>
        {type.desc}
      </Text>
      {selected && (
        <View style={[s.typeCheck, { backgroundColor: type.color }]}>
          <Text style={{ color: "white", fontSize: 10, fontWeight: "800" }}>
            ✓
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  scroll: { padding: ms(20), paddingBottom: ms(20) },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: ms(16),
    paddingVertical: ms(12),
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: ms(8),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: ms(2) },
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
    color: C.text,
    letterSpacing: -0.3,
  },

  // Intro
  introCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: ms(10),
    backgroundColor: "#EFF6FF",
    borderRadius: ms(12),
    padding: ms(14),
    marginBottom: ms(24),
  },
  introText: {
    flex: 1,
    fontSize: ms(13),
    color: "#1E40AF",
    lineHeight: ms(20),
  },

  // Field label
  fieldLabel: {
    fontSize: ms(13),
    fontWeight: "700",
    color: C.text,
    marginBottom: ms(10),
  },

  // Types
  typesRow: { flexDirection: "row", gap: ms(10), marginBottom: ms(24) },
  typeCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: ms(14),
    padding: ms(12),
    borderWidth: 1.5,
    borderColor: C.border,
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: ms(6),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: ms(1) },
    }),
  },
  typeIconBox: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(10),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: ms(8),
  },
  typeLabel: {
    fontSize: ms(12),
    fontWeight: "600",
    color: C.text,
    marginBottom: ms(3),
  },
  typeDesc: { fontSize: ms(10), color: C.muted, lineHeight: ms(14) },
  typeCheck: {
    position: "absolute",
    top: ms(8),
    right: ms(8),
    width: ms(18),
    height: ms(18),
    borderRadius: ms(9),
    justifyContent: "center",
    alignItems: "center",
  },

  // Inputs
  input: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: ms(12),
    padding: ms(14),
    fontSize: ms(14),
    color: C.text,
    marginBottom: ms(4),
  },
  textarea: { minHeight: ms(120), paddingTop: ms(14) },
  charCount: {
    fontSize: ms(11),
    color: C.muted,
    textAlign: "right",
    marginBottom: ms(20),
  },

  // Auto info
  autoInfoCard: {
    backgroundColor: C.white,
    borderRadius: ms(12),
    padding: ms(14),
    borderWidth: 1,
    borderColor: C.border,
    marginTop: ms(4),
  },
  autoInfoTitle: {
    fontSize: ms(11),
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: ms(10),
  },
  autoInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: ms(5),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  autoInfoKey: { fontSize: ms(13), color: C.muted },
  autoInfoValue: { fontSize: ms(13), color: C.text, fontWeight: "500" },

  // Error
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(8),
    backgroundColor: "#FEF2F2",
    borderRadius: ms(10),
    padding: ms(12),
    marginTop: ms(12),
  },
  errorText: { fontSize: ms(13), color: C.danger, flex: 1 },

  // Footer
  footer: {
    padding: ms(16),
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: ms(14),
    padding: ms(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: ms(10),
  },
  submitBtnDisabled: { backgroundColor: "#93C5FD" },
  submitBtnText: { color: "white", fontSize: ms(16), fontWeight: "700" },

  // Success
  successWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: ms(40),
  },
  successIcon: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(40),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: ms(24),
  },
  successTitle: {
    fontSize: ms(24),
    fontWeight: "800",
    color: C.text,
    marginBottom: ms(12),
  },
  successText: {
    fontSize: ms(15),
    color: C.muted,
    textAlign: "center",
    lineHeight: ms(22),
    marginBottom: ms(32),
  },
  successBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: ms(40),
    paddingVertical: ms(14),
    borderRadius: ms(14),
  },
  successBtnText: { color: "white", fontSize: ms(16), fontWeight: "700" },
});
