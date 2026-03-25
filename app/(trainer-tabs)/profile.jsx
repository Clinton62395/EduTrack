/**
 * TrainerProfileScreen.jsx — Redesigned
 * Design language: identique au TrainerDashboard
 *   - Header bleu #2563EB avec avatar centré
 *   - Cards blanches, shadow douce, accent gauche sur master code
 *   - Badges, pills et couleurs du thème
 *   - FilterTabs → SectionTabs visuellement similaires
 */

import { useAuth } from "@/components/constants/authContext";
import { useFormationActions } from "@/components/helpers/actionButton";
import { Snack } from "@/components/ui/snackbar";
import { ms } from "@/components/ui/theme";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Bell,
  BookOpen,
  Briefcase,
  Camera,
  ChevronRight,
  Clock,
  Copy,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  User,
  Users,
} from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoutButton } from "../../components/common/LogoutButton";
import { VisualIdentitySection } from "../../components/features/trainerProfile/profileActions/VisualIdentitySection";

// ─────────────────────────────────────────
// DESIGN TOKENS — miroir exact du Dashboard
// ─────────────────────────────────────────
const C = {
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  primaryDark: "#1D4ED8",
  text: "#0F172A",
  textSub: "#6B7280",
  muted: "#64748B",
  border: "#E5E7EB",
  bg: "#F3F4F6",
  white: "#FFFFFF",
  danger: "#DC2626",
  success: "#16A34A",
  successLight: "#DCFCE7",
  warning: "#F59E0B",
  warningLight: "#FEF9C3",
  slate: "#94A3B8",
};

// ─────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────
export default function TrainerProfileScreen() {
  const { user, logout } = useAuth();
  const { copyToClipboard } = useFormationActions(user);
  const {
    uploading,
    snackbar,
    hideSnackbar,
    handlePhotoUpload,
    updateField,
    uploadProgress,
    uploadType,
    handleLogoUpload,
  } = useTrainerProfile(user);

  const insets = useSafeAreaInsets();

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: ms(120) }]}
      >
        {/* ── HERO HEADER ── */}
        <ProfileHero
          user={user}
          insets={insets}
          uploading={uploadType === "avatar" && uploading}
          progress={uploadType === "avatar" ? uploadProgress : undefined}
          onEditPhoto={handlePhotoUpload}
        />

        {/* ── STATS PILLS ── */}
        <StatsRow user={user} />

        {/* ── MASTER CODE ── */}
        <MasterCodeCard
          masterCode={user?.masterCode}
          onCopy={copyToClipboard}
        />

        {/* ── INFOS PERSONNELLES ── */}
        <SectionCard title="Informations personnelles">
          <InfoRow
            icon={<User size={ms(17)} color={C.primary} />}
            iconBg={C.primaryLight}
            label="Nom complet"
            value={user?.name}
            onSave={(v) => updateField("name", v)}
          />
          <InfoRow
            icon={<Mail size={ms(17)} color={C.muted} />}
            iconBg="#F1F5F9"
            label="Email"
            value={user?.email}
            editable={false}
          />
          <InfoRow
            icon={<Phone size={ms(17)} color={C.success} />}
            iconBg={C.successLight}
            label="Téléphone"
            value={user?.phone}
            placeholder="+224..."
            onSave={(v) => updateField("phone", v)}
          />
          <InfoRow
            icon={<MapPin size={ms(17)} color={C.warning} />}
            iconBg={C.warningLight}
            label="Localisation"
            value={user?.location}
            onSave={(v) => updateField("location", v)}
            last
          />
        </SectionCard>

        {/* ── IDENTITÉ VISUELLE ── */}
        <VisualIdentitySection
          user={user}
          logoUploading={uploadType === "certificateLogo" && uploading}
          uploadProgress={uploadProgress}
          uploadType={uploadType}
          onLogoUpload={handleLogoUpload}
          onUpdate={updateField}
        />

        {/* ── PARAMÈTRES ── */}
        <SectionCard title="Paramètres">
          <SettingsRow
            icon={<Bell size={ms(17)} color={C.primary} />}
            iconBg={C.primaryLight}
            label="Notifications"
            onPress={() => router.push("/settings/notifications")}
          />
          <SettingsRow
            icon={<Shield size={ms(17)} color={C.danger} />}
            iconBg="#FFF1F2"
            label="Changer le mot de passe"
            onPress={() => router.push("/settings/security")}
          />
          <SettingsRow
            icon={<Briefcase size={ms(17)} color={C.muted} />}
            iconBg="#F1F5F9"
            label="À propos de l'application"
            onPress={() => router.push("/settings/aboutApp")}
            last
          />
        </SectionCard>
      </ScrollView>

      {snackbar && (
        <Snack
          visible={snackbar.visible}
          onDismiss={hideSnackbar}
          message={snackbar.message}
          type={snackbar.type}
        />
      )}

      <LogoutButton
        requireMasterCode={false}
        masterCode={user?.masterCode}
        onLogout={logout}
        animationMode="pulse"
      />
    </View>
  );
}

// ─────────────────────────────────────────
// HERO HEADER — même langage que DashboardHeader
// ─────────────────────────────────────────
function ProfileHero({ user, insets, uploading, progress, onEditPhoto }) {
  return (
    <View style={[s.hero, { paddingTop: insets.top + ms(20) }]}>
      {/* Avatar */}
      <View style={s.avatarRing}>
        {user?.avatar || user?.photoURL ? (
          <Image
            source={{ uri: user.avatar || user.photoURL }}
            style={s.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={[s.avatar, s.avatarFallback]}>
            <Text style={s.avatarInitial}>
              {user?.name?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={s.avatarEditBtn}
          onPress={onEditPhoto}
          disabled={uploading}
          activeOpacity={0.85}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <Camera size={ms(13)} color={C.white} strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      </View>

      {/* Name + role */}
      <Text style={s.heroName}>{user?.name || "Formateur"}</Text>
      <Text style={s.heroRole}>{user?.specialty || "Formateur certifié"}</Text>

      {/* Verified pill — même style que les badges du dashboard */}
      <View style={s.verifiedPill}>
        <ShieldCheck size={ms(12)} color={C.primary} strokeWidth={2.5} />
        <Text style={s.verifiedText}>Compte vérifié</Text>
      </View>

      {/* Upload progress bar */}
      {uploading && progress !== undefined && (
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress}%` }]} />
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────
// STATS ROW — même style que la barre du header Dashboard
// ─────────────────────────────────────────
function StatsRow({ user }) {
  const items = [
    {
      icon: <BookOpen size={ms(18)} color={C.white} strokeWidth={2} />,
      value: user?.formationsCount ?? 0,
      label: "Formations",
      bg: C.primary,
    },
    {
      icon: <Users size={ms(18)} color={C.white} strokeWidth={2} />,
      value: user?.learnersCount ?? 0,
      label: "Apprenants",
      bg: C.success,
    },
    {
      icon: <Clock size={ms(18)} color={C.white} strokeWidth={2} />,
      value: user?.attendanceRate != null ? `${user.attendanceRate}%` : "—",
      label: "Taux présence",
      bg: C.warning,
    },
  ];

  return (
    <View style={s.statsRow}>
      {items.map((item, i) => (
        <View
          key={i}
          style={[s.statCell, i < items.length - 1 && s.statDivider]}
        >
          <View style={[s.statIconWrap, { backgroundColor: item.bg }]}>
            {item.icon}
          </View>
          <Text style={s.statValue}>{item.value}</Text>
          <Text style={s.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────
// MASTER CODE — accent bleu gauche identique au dashboard
// ─────────────────────────────────────────
function MasterCodeCard({ masterCode, onCopy }) {
  return (
    <View style={s.masterCard}>
      <View style={s.masterAccent} />
      <View style={s.masterBody}>
        <View style={s.masterIconWrap}>
          <ShieldCheck size={ms(20)} color={C.primary} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.masterLabel}>Code maître</Text>
          <Text style={s.masterValue}>{masterCode || "——"}</Text>
          <Text style={s.masterHint}>Requis pour supprimer une formation</Text>
        </View>
        <Pressable
          onPress={() => onCopy(masterCode)}
          hitSlop={10}
          style={s.copyBtn}
        >
          <Copy size={ms(16)} color={C.primary} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// SECTION CARD — même shadow/radius que les cards du dashboard
// ─────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.cardTitleDot} />
        <Text style={s.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ─────────────────────────────────────────
// INFO ROW
// ─────────────────────────────────────────
function InfoRow({
  icon,
  iconBg,
  label,
  value,
  onSave,
  editable = true,
  placeholder,
  last,
}) {
  return (
    <Pressable
      onPress={editable && onSave ? () => {} : undefined}
      style={({ pressed }) => [
        s.infoRow,
        !last && s.rowBorder,
        pressed && editable && { backgroundColor: "#FAFAFA" },
      ]}
    >
      <View
        style={[s.rowIconWrap, { backgroundColor: iconBg || C.primaryLight }]}
      >
        {icon}
      </View>
      <View style={s.rowTextBlock}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={[s.rowValue, !value && s.rowPlaceholder]}>
          {value || placeholder || "Non renseigné"}
        </Text>
      </View>
      {editable && onSave && (
        <ChevronRight size={ms(16)} color={C.border} strokeWidth={2} />
      )}
    </Pressable>
  );
}

// ─────────────────────────────────────────
// SETTINGS ROW
// ─────────────────────────────────────────
function SettingsRow({ icon, iconBg, label, onPress, last }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.settingsRow,
        !last && s.rowBorder,
        pressed && { backgroundColor: "#FAFAFA" },
      ]}
    >
      <View
        style={[s.rowIconWrap, { backgroundColor: iconBg || C.primaryLight }]}
      >
        {icon}
      </View>
      <Text style={s.settingsLabel}>{label}</Text>
      <ChevronRight size={ms(16)} color={C.muted} strokeWidth={2} />
    </Pressable>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: ms(100) },

  // ── HERO ──
  hero: {
    backgroundColor: C.primary,
    alignItems: "center",
    paddingBottom: ms(28),
    paddingHorizontal: ms(20),
  },
  avatarRing: {
    position: "relative",
    marginBottom: ms(14),
    // Outer glow ring
    width: ms(96),
    height: ms(96),
    borderRadius: ms(48),
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: ms(3),
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: ms(88),
    height: ms(88),
    borderRadius: ms(44),
    borderWidth: ms(3),
    borderColor: C.white,
  },
  avatarFallback: {
    backgroundColor: C.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: ms(32),
    fontWeight: "800",
    color: C.primary,
  },
  avatarEditBtn: {
    position: "absolute",
    bottom: ms(2),
    right: ms(2),
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: C.primaryDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: ms(2),
    borderColor: C.white,
  },
  heroName: {
    fontSize: ms(22),
    fontWeight: "700",
    color: C.white,
    marginBottom: ms(3),
    letterSpacing: -0.3,
  },
  heroRole: {
    fontSize: ms(13),
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    marginBottom: ms(12),
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(5),
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: ms(12),
    paddingVertical: ms(5),
    borderRadius: ms(20),
  },
  verifiedText: {
    fontSize: ms(12),
    color: C.white,
    fontWeight: "600",
  },
  progressTrack: {
    width: "60%",
    height: ms(3),
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: ms(2),
    overflow: "hidden",
    marginTop: ms(12),
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.white,
    borderRadius: ms(2),
  },

  // ── STATS ──
  statsRow: {
    flexDirection: "row",
    backgroundColor: C.white,
    marginHorizontal: ms(16),
    marginTop: ms(-1), // flush sous le hero
    borderBottomLeftRadius: ms(16),
    borderBottomRightRadius: ms(16),
    paddingVertical: ms(16),
    shadowColor: "#0F172A",
    shadowOpacity: 0.07,
    shadowRadius: ms(10),
    shadowOffset: { width: 0, height: ms(4) },
    elevation: 3,
  },
  statCell: { flex: 1, alignItems: "center", gap: ms(6) },
  statDivider: { borderRightWidth: 1, borderRightColor: C.border },
  statIconWrap: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(10),
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: ms(18),
    fontWeight: "700",
    color: C.text,
  },
  statLabel: {
    fontSize: ms(11),
    color: C.muted,
    fontWeight: "500",
    textAlign: "center",
  },

  // ── MASTER CODE ──
  masterCard: {
    flexDirection: "row",
    backgroundColor: C.white,
    marginHorizontal: ms(16),
    marginTop: ms(16),
    borderRadius: ms(14),
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: ms(8),
    shadowOffset: { width: 0, height: ms(2) },
    elevation: 2,
  },
  masterAccent: {
    width: ms(4),
    backgroundColor: C.primary,
  },
  masterBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: ms(16),
    gap: ms(12),
  },
  masterIconWrap: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(12),
    backgroundColor: C.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  masterLabel: {
    fontSize: ms(11),
    color: C.muted,
    fontWeight: "500",
    marginBottom: ms(2),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  masterValue: {
    fontSize: ms(24),
    fontWeight: "800",
    color: C.primary,
    letterSpacing: ms(5),
    marginBottom: ms(2),
  },
  masterHint: {
    fontSize: ms(11),
    color: C.muted,
  },
  copyBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(10),
    backgroundColor: C.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── SECTION CARD ──
  card: {
    backgroundColor: C.white,
    marginHorizontal: ms(16),
    marginTop: ms(16),
    borderRadius: ms(14),
    paddingHorizontal: ms(16),
    paddingTop: ms(14),
    paddingBottom: ms(4),
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: ms(8),
    shadowOffset: { width: 0, height: ms(2) },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(8),
    marginBottom: ms(4),
  },
  cardTitleDot: {
    width: ms(4),
    height: ms(16),
    borderRadius: ms(2),
    backgroundColor: C.primary,
  },
  cardTitle: {
    fontSize: ms(12),
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // ── ROWS ──
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowIconWrap: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: ms(12),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: ms(12),
    borderRadius: ms(8),
  },
  rowTextBlock: { flex: 1 },
  rowLabel: {
    fontSize: ms(11),
    color: C.muted,
    fontWeight: "500",
    marginBottom: ms(2),
  },
  rowValue: {
    fontSize: ms(15),
    color: C.text,
    fontWeight: "500",
  },
  rowPlaceholder: {
    color: C.slate,
    fontStyle: "italic",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: ms(12),
    borderRadius: ms(8),
    gap: ms(0),
  },
  settingsLabel: {
    flex: 1,
    fontSize: ms(15),
    color: C.text,
    fontWeight: "500",
  },
});
