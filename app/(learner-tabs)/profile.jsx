import { Box, Text } from "@/components/ui/theme";
import { Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Tes composants communs (on les réutilise !)
import { ProfileField } from "@/components/common/profileField";
import { ProfileHeader } from "@/components/common/profileHearder";
import { ProfileSection } from "@/components/common/profileSection";
import { ProfileStats } from "@/components/common/profileStact";
import { Snack } from "@/components/ui/snackbar";

import { useAuth } from "@/components/constants/authContext";
import { useTrainerProfile } from "@/hooks/useTrainerProfile"; // On peut même réutiliser ce hook s'il est assez générique !
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
import { LogoutButton } from "../../components/common/LogoutButton";

export default function LearnerProfileScreen() {
  const { user, logout } = useAuth();
  
  const router = useRouter();

  // On réutilise la même logique de profil (upload photo, update champs, snackbar)
  const {
    uploading,
    snackbar,
    hideSnackbar,
    handlePhotoUpload,
    updateField,
    confirmLogout,
    uploadProgress,
  } = useTrainerProfile(user, logout);

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 1. HEADER (Réutilisé) */}
          <ProfileHeader
            user={user}
            role="Apprenant"
            onEditPhoto={handlePhotoUpload}
            uploading={uploading}
            progress={uploadProgress}
          />

          {/* 2. STATS APPRENANT (Réutilisé avec nouvelles valeurs) */}
          <Box paddingHorizontal="m" marginTop="m">
            <ProfileStats
              stats={[
                {
                  label: "Inscriptions",
                  value: user?.trainingsJoinedCount || 0,
                  icon: BookOpen,
                },
                {
                  label: "Heures",
                  value: "24h",
                  icon: Clock,
                },
                {
                  label: "Badges",
                  value: user?.badgesCount || 0,
                  icon: Award,
                },
                {
                  label: "Progression",
                  value: "75%",
                  icon: Star,
                },
              ]}
            />
          </Box>

          {/* 3. INFOS PERSONNELLES (Réutilisé) */}
          <Box
            marginHorizontal="m"
            marginTop="m"
            backgroundColor="white"
            borderRadius="l"
            paddingBottom="m"
          >
            <ProfileSection title="Mon Profil">
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
          </Box>

          {/* 4. SÉCURITÉ & NOTIFS (Réutilisé) */}
          <Box
            marginHorizontal="m"
            marginTop="m"
            backgroundColor="white"
            borderRadius="l"
            padding="m"
          >
            <Text variant="body" fontWeight="700" marginBottom="m">
              Réglages
            </Text>

            {/* Notifs */}
            <Pressable
              onPress={() => router.push("/settings/notifications")}
              style={{ marginBottom: 15 }}
            >
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box flexDirection="row" gap="m">
                  <Bell size={20} color="#6B7280" />
                  <Text variant="body">Notifications</Text>
                </Box>
                <ChevronRight size={20} color="#6B7280" />
              </Box>
            </Pressable>

            {/* Sécurité */}
            <Pressable onPress={() => router.push("/settings/security")}>
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box flexDirection="row" gap="m">
                  <Shield size={20} color="#6B7280" />
                  <Text variant="body">Sécurité du compte</Text>
                </Box>
                <ChevronRight size={20} color="#6B7280" />
              </Box>
            </Pressable>
          </Box>

          {/* 5. ACTIONS FINALES (Réutilisé) */}
          <Box padding="l">
            <LogoutButton />
          </Box>

          <Box height={50} />
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
    </Box>
  );
}
