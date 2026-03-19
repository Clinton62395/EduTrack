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
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoutButton } from "../../components/common/LogoutButton";
import { VisualIdentitySection } from "../../components/features/trainerProfile/profileActions/VisualIdentitySection";

// ─────────────────────────────────────────
// COULEURS (alignées sur le thème)
// ─────────────────────────────────────────
const C = {
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E5E7EB",
  bg: "#F9FAFB",
  white: "#FFFFFF",
  danger: "#DC2626",
  success: "#16A34A",
  warning: "#F59E0B",
};

// ─────────────────────────────────────────
// SCREEN PRINCIPAL
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

  return (
    <View style={s.root}>
      <SafeAreaView style={s.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          stickyHeaderIndices={[0]}
        >
          {/* ── HEADER PROFIL ── */}
          <ProfileHeader
            user={user}
            uploading={uploadType === "avatar" && uploading}
            progress={uploadType === "avatar" ? uploadProgress : undefined}
            onEditPhoto={handlePhotoUpload}
          />

          {/* ── STATS ── */}
          <StatsRow user={user} />

          {/* ── MASTER CODE ── */}
          <MasterCodeCard
            masterCode={user?.masterCode}
            onCopy={copyToClipboard}
          />

          {/* ── INFOS PERSONNELLES ── */}
          <SectionCard title="Informations personnelles">
            <InfoRow
              icon={<User size={18} color={C.muted} />}
              label="Nom complet"
              value={user?.name}
              onSave={(v) => updateField("name", v)}
            />
            <InfoRow
              icon={<Mail size={18} color={C.muted} />}
              label="Email"
              value={user?.email}
              editable={false}
            />
            <InfoRow
              icon={<Phone size={18} color={C.muted} />}
              label="Téléphone"
              value={user?.phone}
              placeholder="+224..."
              onSave={(v) => updateField("phone", v)}
            />
            <InfoRow
              icon={<MapPin size={18} color={C.muted} />}
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
              icon={<Bell size={18} color={C.muted} />}
              label="Notifications"
              onPress={() => router.push("/settings/notifications")}
            />
            <SettingsRow
              icon={<Shield size={18} color={C.muted} />}
              label="Changer le mot de passe"
              onPress={() => router.push("/settings/security")}
            />
            <SettingsRow
              icon={<Briefcase size={18} color={C.muted} />}
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
      </SafeAreaView>

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
// HEADER PROFIL
// ─────────────────────────────────────────
function ProfileHeader({ user, uploading, progress, onEditPhoto }) {
  return (
    <View style={s.headerWrap}>
      <View style={s.headerBg} />
      <View style={s.headerContent}>
        {/* Avatar */}
        <View style={s.avatarWrap}>
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
            style={s.avatarEdit}
            onPress={onEditPhoto}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <Camera size={14} color={C.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Nom + rôle */}
        <Text style={s.headerName}>{user?.name || "Formateur"}</Text>
        <Text style={s.headerRole}>{user?.specialty || "Formateur"}</Text>

        {/* Badge vérifié */}
        <View style={s.verifiedBadge}>
          <ShieldCheck size={13} color={C.primary} />
          <Text style={s.verifiedText}>Compte vérifié</Text>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// STATS
// ─────────────────────────────────────────
function StatsRow({ user }) {
  const stats = [
    {
      icon: <BookOpen size={20} color={C.primary} />,
      value: user?.formationsCount || 0,
      label: "Formations",
    },
    {
      icon: <Users size={20} color={C.success} />,
      value: user?.learnersCount || 0,
      label: "Apprenants",
    },
    // ✅ attendanceRate masqué jusqu'au calcul réel
    {
      icon: <Clock size={20} color={C.warning} />,
      value: user?.attendanceRate !== null ? `${user?.attendanceRate}%` : "—",
      label: "Taux",
    },
    // ✅ rating masqué jusqu'au système de notation
    // { icon: <Star size={20} color={C.warning} />, value: user?.rating || "—", label: "Note" },
  ];

  return (
    <View style={s.statsRow}>
      {stats.map((stat, i) => (
        <View key={i} style={[s.statBox, i < stats.length - 1 && s.statBorder]}>
          {stat.icon}
          <Text style={s.statValue}>{stat.value}</Text>
          <Text style={s.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────
// MASTER CODE CARD
// ✅ invitationCode supprimé — rôle non défini
// ─────────────────────────────────────────
function MasterCodeCard({ masterCode, onCopy }) {
  return (
    <View style={s.masterCard}>
      <View style={s.masterLeft}>
        <ShieldCheck size={20} color={C.primary} />
        <View style={{ marginLeft: ms(12) }}>
          <Text style={s.masterLabel}>Code maître</Text>
          <Text style={s.masterValue}>{masterCode || "——"}</Text>
          <Text style={s.masterHint}>Requis pour supprimer une formation</Text>
        </View>
      </View>
      <Pressable onPress={() => onCopy(masterCode)} hitSlop={8}>
        <Copy size={18} color={C.primary} />
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────
// SECTION CARD
// ─────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─────────────────────────────────────────
// INFO ROW (éditable inline)
// ─────────────────────────────────────────
function InfoRow({
  icon,
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
      style={[s.infoRow, !last && s.infoRowBorder]}
    >
      <View style={s.infoRowLeft}>
        {icon}
        <View style={{ marginLeft: ms(12) }}>
          <Text style={s.infoLabel}>{label}</Text>
          <Text style={[s.infoValue, !value && s.infoPlaceholder]}>
            {value || placeholder || "Non renseigné"}
          </Text>
        </View>
      </View>
      {editable && onSave && <ChevronRight size={16} color={C.border} />}
    </Pressable>
  );
}

// ─────────────────────────────────────────
// SETTINGS ROW
// ─────────────────────────────────────────
function SettingsRow({ icon, label, onPress, last }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.settingsRow,
        !last && s.infoRowBorder,
        pressed && { backgroundColor: C.bg },
      ]}
    >
      <View style={s.infoRowLeft}>
        <View style={s.settingsIconWrap}>{icon}</View>
        <Text style={s.settingsLabel}>{label}</Text>
      </View>
      <ChevronRight size={16} color={C.muted} />
    </Pressable>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  scroll: { paddingBottom: ms(100) },

  // Header
  headerWrap: { backgroundColor: C.white, marginBottom: 0 },
  headerBg: {
    height: ms(80),
    backgroundColor: C.primary,
  },
  headerContent: {
    alignItems: "center",
    paddingBottom: ms(24),
    marginTop: ms(-44),
  },
  avatarWrap: { position: "relative", marginBottom: ms(12) },
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
  avatarInitial: { fontSize: ms(32), fontWeight: "700", color: C.primary },
  avatarEdit: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: ms(26),
    height: ms(26),
    borderRadius: ms(13),
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: ms(2),
    borderColor: C.white,
  },
  headerName: {
    fontSize: ms(20),
    fontWeight: "700",
    color: C.text,
    marginBottom: ms(2),
  },
  headerRole: { fontSize: ms(14), color: C.muted, marginBottom: ms(8) },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(4),
    backgroundColor: C.primaryLight,
    paddingHorizontal: ms(10),
    paddingVertical: ms(3),
    borderRadius: ms(20),
  },
  verifiedText: { fontSize: ms(12), color: C.primary, fontWeight: "600" },

  // Stats
  statsRow: {
    flexDirection: "row",
    backgroundColor: C.white,
    marginHorizontal: ms(16),
    marginTop: ms(16),
    borderRadius: ms(16),
    paddingVertical: ms(16),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: ms(8),
    elevation: ms(2),
  },
  statBox: { flex: 1, alignItems: "center", gap: ms(4) },
  statBorder: { borderRightWidth: 1, borderRightColor: C.border },
  statValue: { fontSize: ms(20), fontWeight: "700", color: C.text },
  statLabel: { fontSize: ms(12), color: C.muted },

  // Master code
  masterCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.white,
    marginHorizontal: ms(16),
    marginTop: ms(16),
    borderRadius: ms(16),
    padding: ms(16),
    borderLeftWidth: ms(4),
    borderLeftColor: C.primary,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: ms(8),
    elevation: ms(2),
  },
  masterLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  masterLabel: { fontSize: ms(12), color: C.muted, marginBottom: ms(2) },
  masterValue: {
    fontSize: ms(22),
    fontWeight: "800",
    color: C.primary,
    letterSpacing: 4,
  },
  masterHint: { fontSize: ms(11), color: C.muted, marginTop: ms(2) },

  // Cards
  card: {
    backgroundColor: C.white,
    marginHorizontal: ms(16),
    marginTop: ms(16),
    borderRadius: ms(16),
    paddingHorizontal: ms(16),
    paddingTop: ms(16),
    paddingBottom: ms(8),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: ms(8),
    elevation: ms(2),
  },
  cardTitle: {
    fontSize: ms(13),
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: ms(12),
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ms(12),
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: C.bg },
  infoRowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  infoLabel: { fontSize: ms(12), color: C.muted, marginBottom: ms(2) },
  infoValue: { fontSize: ms(15), color: C.text, fontWeight: "500" },
  infoPlaceholder: { color: C.muted, fontStyle: "italic" },

  // Settings rows
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ms(14),
  },
  settingsIconWrap: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(10),
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: ms(12),
  },
  settingsLabel: { fontSize: ms(15), color: C.text, fontWeight: "500" },
});
