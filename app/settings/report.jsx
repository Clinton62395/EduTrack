import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase";
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
  scroll: { padding: 20, paddingBottom: 20 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.3,
  },

  // Intro
  introCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  introText: { flex: 1, fontSize: 13, color: "#1E40AF", lineHeight: 20 },

  // Field label
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
    marginBottom: 10,
  },

  // Types
  typesRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  typeCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 1 },
    }),
  },
  typeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.text,
    marginBottom: 3,
  },
  typeDesc: { fontSize: 10, color: C.muted, lineHeight: 14 },
  typeCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  // Inputs
  input: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: C.text,
    marginBottom: 4,
  },
  textarea: { minHeight: 120, paddingTop: 14 },
  charCount: {
    fontSize: 11,
    color: C.muted,
    textAlign: "right",
    marginBottom: 20,
  },

  // Auto info
  autoInfoCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 4,
  },
  autoInfoTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  autoInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  autoInfoKey: { fontSize: 13, color: C.muted },
  autoInfoValue: { fontSize: 13, color: C.text, fontWeight: "500" },

  // Error
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  errorText: { fontSize: 13, color: C.danger, flex: 1 },

  // Footer
  footer: {
    padding: 16,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  submitBtnDisabled: { backgroundColor: "#93C5FD" },
  submitBtnText: { color: "white", fontSize: 16, fontWeight: "700" },

  // Success
  successWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: C.text,
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: C.muted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  successBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
  },
  successBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
});
