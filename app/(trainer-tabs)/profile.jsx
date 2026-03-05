import { Snack } from "@/components/ui/snackbar";
import { BookOpen, Clock, Star, User } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileHeader } from "@/components/common/profileHearder";
import { ProfileStats } from "@/components/common/profileStact";
import { useAuth } from "@/components/constants/authContext";
import { useFormationActions } from "@/components/helpers/actionButton";
import { Box } from "@/components/ui/theme";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { LogoutButton } from "../../components/common/LogoutButton";
import { ExpertiseSection } from "../../components/features/trainerProfile/profileActions/ExpertiseSection";
import { InvitationCodesCard } from "../../components/features/trainerProfile/profileActions/InvitationCodesCard";
import { PersonalInfoSection } from "../../components/features/trainerProfile/profileActions/PersonalInfoSection";
import { SettingsSection } from "../../components/features/trainerProfile/profileActions/SettingsSection";
import { VisualIdentitySection } from "../../components/features/trainerProfile/profileActions/VisualIdentitySection";

// Composants refactorisés

const STATS_CONFIG = (user) => [
  { label: "Formations", value: user?.formationsCount || 0, icon: BookOpen },
  { label: "Apprenants", value: user?.learnersCount || 0, icon: User },
  { label: "Taux", value: `${user?.attendanceRate || 0}%`, icon: Clock },
  { label: "Note", value: user?.rating || "4.9", icon: Star },
];

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
  } = useTrainerProfile(user, logout);

  return (
    <View style={{ flex: 1 }}>
      <Box flex={1} backgroundColor="secondaryBackground">
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={[0]}
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            <ProfileHeader
              user={user}
              role={user?.role || "Formateur"} // TODO: à supprimer
              onEditPhoto={handlePhotoUpload}
              uploading={uploadType === "avatar" ? true : false}
              progress={uploadType === "avatar" ? uploadProgress : undefined}
            />

            <Box paddingHorizontal="m" marginTop="m">
              <ProfileStats stats={STATS_CONFIG(user)} />
            </Box>

            <InvitationCodesCard
              invitationCode={user?.invitationCode}
              masterCode={user?.masterCode}
              onCopy={copyToClipboard}
            />

            <PersonalInfoSection user={user} onUpdate={updateField} />

            <ExpertiseSection user={user} onUpdate={updateField} />

            <VisualIdentitySection
              user={user}
              logoUploading={uploadType === "certificateLogo" && uploading}
              uploadProgress={uploadProgress}
              uploadType={uploadType}
              onLogoUpload={handleLogoUpload}
              onUpdate={updateField}
            />

            <SettingsSection />
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

      <LogoutButton
        requireMasterCode={false}
        masterCode={user?.masterCode}
        onLogout={logout}
        animationMode="pulse"
      />
    </View>
  );
}
