import { ProfileField } from "@/components/common/profileField";
import { ProfileHeader } from "@/components/common/profileHearder";
import { ProfileSection } from "@/components/common/profileSection";
import { ProfileStats } from "@/components/common/profileStact";
import { useAuth } from "@/components/constants/authContext";
import { useCertificate } from "@/components/features/learnerProfile/hooks/useCertificate";
import { useLearnerTrainings } from "@/components/features/learnerProfile/hooks/useLearnerTrainings";
import { Snack } from "@/components/ui/snackbar";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { useRouter } from "expo-router";
import {
  Award,
  Bell,
  BookOpen,
  ChevronRight,
  Clock,
  Lock,
  Mail,
  Phone,
  Shield,
  Sparkles,
  Star,
} from "lucide-react-native";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoutButton } from "../../components/common/LogoutButton";

export default function LearnerProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const {
    uploading,
    snackbar,
    hideSnackbar,
    handlePhotoUpload,
    updateField,
    uploadProgress,
  } = useTrainerProfile(user, logout);

  const { myTrainings } = useLearnerTrainings(user?.uid);
  const formation = myTrainings?.[0];
  const { certificate, eligible } = useCertificate(
    user?.uid,
    formation?.id,
    formation,
    user?.name || "Apprenant",
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* 1. HEADER */}
          <ProfileHeader
            user={user}
            role="Apprenant"
            onEditPhoto={handlePhotoUpload}
            uploading={uploading}
            progress={uploadProgress}
          />

          {/* 2. STATS */}
          <View style={styles.statsContainer}>
            <ProfileStats
              stats={[
                {
                  label: "Formations",
                  value: user?.trainingsJoinedCount || 0,
                  icon: BookOpen,
                },
                {
                  label: "Heures",
                  value: `${Math.round((user?.modulesCompletedCount * 20) / 60)}h`,
                  icon: Clock,
                },
                {
                  label: "Certificats",
                  value: user?.certificatesCount || 0,
                  icon: Award,
                },
                {
                  label: "Moyenne",
                  value: `${user?.averageProgression || 0}%`,
                  icon: Star,
                },
              ]}
            />
          </View>

          {/* 3. CERTIFICAT */}
          <CertificateBanner
            certificate={certificate}
            eligible={eligible}
            formation={formation}
            onPress={() =>
              router.push("/(learner-stack)/my-trainings/certificate")
            }
          />

          {/* 4. INFOS PERSONNELLES */}
          <SectionCard title="Mon Profil" style={{ marginTop: 16 }}>
            <ProfileSection title="">
              <ProfileField
                label="Nom complet"
                value={user?.name}
                onSave={(v) => updateField("name", v)}
              />
              <ProfileField
                label="Email"
                value={user?.email}
                editable={false}
                icon={<Mail size={18} color="#6B7280" />}
              />
              <ProfileField
                label="Téléphone"
                value={user?.phone}
                placeholder="+224..."
                onSave={(v) => updateField("phone", v)}
                icon={<Phone size={18} color="#6B7280" />}
              />
            </ProfileSection>
          </SectionCard>

          {/* 5. RÉGLAGES */}
          <SectionCard title="Réglages" style={{ marginTop: 16 }}>
            <SettingsRow
              icon={<Bell size={18} color="#6B7280" />}
              label="Notifications"
              onPress={() => router.push("/settings/notifications")}
            />
            <View style={styles.settingsDivider} />
            <SettingsRow
              icon={<Shield size={18} color="#6B7280" />}
              label="Sécurité du compte"
              onPress={() => router.push("/settings/security")}
            />
          </SectionCard>

          {/* 6. DÉCONNEXION */}
          <View style={styles.logoutContainer}>
            <LogoutButton />
          </View>

          <View style={{ height: 40 }} />
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
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 CERTIFICATE BANNER
// ─────────────────────────────────────────
function CertificateBanner({ certificate, eligible, formation, onPress }) {
  const isObtained = !!certificate;
  const isReady = !certificate && eligible;

  const config = isObtained
    ? {
        bg: "#EFF6FF",
        border: "#BFDBFE",
        iconBg: "#DBEAFE",
        iconColor: "#2563EB",
        badge: "#2563EB",
        badgeBg: "#DBEAFE",
      }
    : isReady
      ? {
          bg: "#F0FDF4",
          border: "#BBF7D0",
          iconBg: "#DCFCE7",
          iconColor: "#10B981",
          badge: "#10B981",
          badgeBg: "#DCFCE7",
        }
      : {
          bg: "#F8FAFC",
          border: "#E2E8F0",
          iconBg: "#F1F5F9",
          iconColor: "#94A3B8",
          badge: "#94A3B8",
          badgeBg: "#F1F5F9",
        };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.bannerWrapper}
    >
      <View
        style={[
          styles.banner,
          { backgroundColor: config.bg, borderColor: config.border },
        ]}
      >
        {/* Accent top */}
        {isObtained && (
          <View style={[styles.bannerAccent, { backgroundColor: "#2563EB" }]} />
        )}
        {isReady && (
          <View style={[styles.bannerAccent, { backgroundColor: "#10B981" }]} />
        )}

        <View style={styles.bannerContent}>
          {/* Icône */}
          <View
            style={[styles.bannerIconBox, { backgroundColor: config.iconBg }]}
          >
            {isObtained ? (
              <Sparkles size={22} color={config.iconColor} />
            ) : isReady ? (
              <Award size={22} color={config.iconColor} />
            ) : (
              <Lock size={22} color={config.iconColor} />
            )}
          </View>

          {/* Texte */}
          <View style={styles.bannerText}>
            <View style={styles.bannerTitleRow}>
              <Text style={[styles.bannerTitle, { color: config.iconColor }]}>
                {isObtained
                  ? "Certificat obtenu ✓"
                  : isReady
                    ? "Prêt à générer 🎓"
                    : "Certificat verrouillé"}
              </Text>
              <View
                style={[
                  styles.bannerBadge,
                  { backgroundColor: config.badgeBg },
                ]}
              >
                <Text style={[styles.bannerBadgeText, { color: config.badge }]}>
                  {isObtained ? "Disponible" : isReady ? "Nouveau" : "Bloqué"}
                </Text>
              </View>
            </View>
            <Text style={styles.bannerSub} numberOfLines={1}>
              {isObtained
                ? formation?.title || "Formation complétée"
                : isReady
                  ? "Appuyez pour générer votre certificat"
                  : "Complétez toutes les leçons et quiz"}
            </Text>
          </View>

          <ChevronRight size={18} color={config.iconColor} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────
// 🧩 SECTION CARD
// ─────────────────────────────────────────
function SectionCard({ title, children, style }) {
  return (
    <View style={[styles.sectionCard, style]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 SETTINGS ROW
// ─────────────────────────────────────────
function SettingsRow({ icon, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.settingsRow, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.settingsRowLeft}>
        <View style={styles.settingsIconBox}>{icon}</View>
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <ChevronRight size={18} color="#CBD5E1" />
    </Pressable>
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
    paddingBottom: 20,
  },

  // STATS
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },

  // BANNER
  bannerWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  banner: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 3 },
    }),
  },
  bannerAccent: {
    height: 3,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  bannerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerText: {
    flex: 1,
    gap: 4,
  },
  bannerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  bannerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  bannerSub: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },

  // SECTION CARD
  sectionCard: {
    marginHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
    letterSpacing: -0.2,
  },

  // SETTINGS
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  settingsDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  // LOGOUT
  logoutContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
});
