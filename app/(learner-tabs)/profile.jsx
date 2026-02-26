import { Box, Text } from "@/components/ui/theme";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileField } from "@/components/common/profileField";
import { ProfileHeader } from "@/components/common/profileHearder";
import { ProfileSection } from "@/components/common/profileSection";
import { ProfileStats } from "@/components/common/profileStact";
import { Snack } from "@/components/ui/snackbar";

import { useAuth } from "@/components/constants/authContext";
import { useCertificate } from "@/components/features/learnerProfile/hooks/useCertificate";
import { useLearnerTrainings } from "@/components/features/learnerProfile/hooks/useLearnerTrainings";
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

  // ── Certificat ──
  const { myTrainings } = useLearnerTrainings(user?.uid);
  const trainingId = user?.enrolledTrainings?.[0];
  const formation = myTrainings?.[0];

  const { certificate, eligible } = useCertificate(
    user?.uid,
    trainingId,
    formation,
    user?.name || "Apprenant",
  );

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 1. HEADER */}
          <ProfileHeader
            user={user}
            role="Apprenant"
            onEditPhoto={handlePhotoUpload}
            uploading={uploading}
            progress={uploadProgress}
          />

          {/* 2. STATS */}
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
          </Box>

          {/* 3. CERTIFICAT */}
          <Box
            marginHorizontal="m"
            marginTop="m"
            backgroundColor="white"
            borderRadius="l"
            padding="m"
            style={styles.card}
          >
            <Text variant="body" fontWeight="700" marginBottom="m">
              Mon Certificat
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push("/(learner-tabs)/my-trainings/certificate")
              }
            >
              <Box
                borderRadius="l"
                padding="m"
                flexDirection="row"
                alignItems="center"
                gap="m"
                borderWidth={certificate ? 2 : 1}
                borderColor={certificate ? "primary" : "border"}
                backgroundColor={
                  certificate ? "white" : "secondaryBackground"
                }
              >
                {/* Icône */}
                <Box
                  width={44}
                  height={44}
                  borderRadius="m"
                  backgroundColor={
                    certificate ? "#DBEAFE" : "secondaryBackground"
                  }
                  justifyContent="center"
                  alignItems="center"
                >
                  <Award
                    size={24}
                    color={certificate ? "primary" : ""}
                  />
                </Box>

                {/* Texte */}
                <Box flex={1}>
                  <Text
                    variant="body"
                    fontWeight="bold"
                    color={certificate ? "primary" : "text"}
                  >
                    {certificate
                      ? "Certificat obtenu ✓"
                      : eligible
                        ? "Prêt à générer 🎓"
                        : "Certificat verrouillé"}
                  </Text>
                  <Text variant="caption" color="muted">
                    {certificate
                      ? formation?.title || "Formation complétée"
                      : eligible
                        ? "Appuyez pour générer votre certificat"
                        : "Complétez toutes les leçons et quiz"}
                  </Text>
                </Box>

                <ChevronRight
                  size={20}
                  color={certificate ? "#2563EB" : "#6B7280"}
                />
              </Box>
            </TouchableOpacity>
          </Box>

          {/* 4. INFOS PERSONNELLES */}
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

          {/* 5. RÉGLAGES */}
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

          {/* 6. DÉCONNEXION */}
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

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
});
