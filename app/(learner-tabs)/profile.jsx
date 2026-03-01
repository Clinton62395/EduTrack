import { LogoutButton } from "@/components/common/LogoutButton";
import { ProfileField } from "@/components/common/profileField";
import { ProfileHeader } from "@/components/common/profileHearder";
import { ProfileSection } from "@/components/common/profileSection";
import { ProfileStats } from "@/components/common/profileStact";
import { useAuth } from "@/components/constants/authContext";
import { CertificateBanner } from "@/components/features/learnerProfile/certificateAction/certificateBanner";
import { Snack } from "@/components/ui/snackbar";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
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

          {/* 3. CERTIFICAT — composant autonome */}
          <CertificateBanner userId={user?.uid} userName={user?.name} />

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
            <View style={styles.settingsDivider} />
            <SettingsRow
              icon={<BookOpen size={18} color="#6B7280" />}
              label="À propos"
              onPress={() => router.push("/settings/aboutApp")}
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

function SectionCard({ title, children, style }) {
  return (
    <View style={[styles.sectionCard, style]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
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
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { paddingBottom: 20 },
  statsContainer: { paddingHorizontal: 16, marginTop: 16 },
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
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingsRowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingsIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsLabel: { fontSize: 14, fontWeight: "500", color: "#374151" },
  settingsDivider: { height: 1, backgroundColor: "#F1F5F9" },
  logoutContainer: { marginHorizontal: 16, marginTop: 16 },
});
