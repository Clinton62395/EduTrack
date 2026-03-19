import { LogoutButton } from "@/components/common/LogoutButton";
import { ProfileField } from "@/components/common/profileField";
import { ProfileHeader } from "@/components/common/profileHearder";
import { ProfileSection } from "@/components/common/profileSection";
import { ProfileStats } from "@/components/common/profileStact";
import { useAuth } from "@/components/constants/authContext";
import { CertificateBanner } from "@/components/features/learnerProfile/certificateAction/certificateBanner";
import { Snack } from "@/components/ui/snackbar";
import { ms } from "@/components/ui/theme";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import {
  Award,
  Bell,
  BookOpen,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  Shield,
  Star,
} from "lucide-react-native";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLearnerStats } from "../../components/features/learnerProfile/hooks/useLearnerStack";

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
  } = useTrainerProfile(user);

  // ✅ Stats réelles calculées depuis Firestore
  const { stats } = useLearnerStats(user?.uid, user?.enrolledTrainings || []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* 1. HEADER */}
          <BlurView intensity={60} tint="light" style={styles.headerGlass}>
            <ProfileHeader
              user={user}
              role="Apprenant"
              onEditPhoto={handlePhotoUpload}
              uploading={uploading}
              progress={uploadProgress}
            />
          </BlurView>

          {/* 2. STATS — valeurs réelles ✅ */}
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
                  // ✅ Calculé depuis les leçons complétées × 15 min
                  value:
                    stats.estimatedHours > 0
                      ? `${stats.estimatedHours}h`
                      : "0h",
                  icon: Clock,
                },
                {
                  label: "Certificats",
                  // ✅ Compté depuis la collection certificates
                  value: stats.certificatesCount,
                  icon: Award,
                },
                {
                  label: "Moyenne",
                  // ✅ Calculé depuis userProgress / total leçons
                  value: `${stats.averageProgression}%`,
                  icon: Star,
                },
              ]}
            />
          </View>

          {/* 3. CERTIFICAT */}
          <CertificateBanner userId={user?.uid} userName={user?.name} />

          {/* 4. INFOS PERSONNELLES */}
          <SectionCard title="Mon Profil" style={{ marginTop: ms(16) }}>
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
            <View style={styles.settingsDivider} />
            <SettingsRow
              icon={<BookOpen size={18} color="#6B7280" />}
              label="À propos"
              onPress={() => router.push("/settings/aboutApp")}
            />
          </SectionCard>

          <View style={{ height: ms(80) }} />
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

      <LogoutButton onLogout={logout} animationMode="pulse" />
    </View>
  );
}

function SectionCard({ title, children, style }) {
  return (
    <BlurView intensity={60} tint="light" style={[styles.sectionCard, style]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </BlurView>
  );
}

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FA" },
  scroll: { paddingBottom: ms(20) },
  headerGlass: {
    marginHorizontal: ms(16),
    marginTop: ms(16),
    borderRadius: ms(18),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: ms(12),
        shadowOffset: { width: 0, height: ms(6) },
      },
      android: { elevation: ms(2) },
    }),
  },
  statsContainer: { paddingHorizontal: ms(16), marginTop: ms(16) },
  sectionCard: {
    marginHorizontal: ms(16),
    backgroundColor: "rgba(255,255,255,0.62)",
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    padding: ms(16),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: ms(10),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: ms(2) },
    }),
  },
  sectionTitle: {
    fontSize: ms(15),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: ms(14),
    letterSpacing: -0.2,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ms(12),
  },
  settingsRowLeft: { flexDirection: "row", alignItems: "center", gap: ms(12) },
  settingsIconBox: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(10),
    backgroundColor: "rgba(241,245,249,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsLabel: { fontSize: ms(14), fontWeight: "500", color: "#374151" },
  settingsDivider: { height: 1, backgroundColor: "rgba(241,245,249,0.8)" },
});
