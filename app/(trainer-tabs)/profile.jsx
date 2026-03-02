import { Snack } from "@/components/ui/snackbar";
import { router } from "expo-router";
import {
  Bell,
  BookOpen,
  Briefcase,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  ImageIcon,
  Mail,
  MapPin,
  Palette,
  Phone,
  Shield,
  Star,
  User,
} from "lucide-react-native";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { ProfileField } from "@/components/common/profileField";
import { ProfileHeader } from "@/components/common/profileHearder";
import { ProfileSection } from "@/components/common/profileSection";
import { ProfileStats } from "@/components/common/profileStact";
import { useAuth } from "@/components/constants/authContext";
import { useFormationActions } from "@/components/helpers/actionButton";
import { Box, Text } from "@/components/ui/theme";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoutButton } from "../../components/common/LogoutButton";

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
    handleLogoUpload,
  } = useTrainerProfile(user, logout);
  return (
    <View style={{ flex: 1, position: "relative" }}>
      <Box flex={1} backgroundColor="secondaryBackground">
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={[0]}
          >
            {/* HEADER AVEC PHOTO & NOM */}
            <ProfileHeader
              user={user}
              role={user?.role || "Formateur"}
              onEditPhoto={handlePhotoUpload}
              uploading={uploading}
              progress={uploadProgress}
            />

            {/* STATS RAPIDES (Style Cartes Restyle) */}
            <Box paddingHorizontal="m" marginTop="m">
              <ProfileStats
                stats={[
                  {
                    label: "Formations",
                    value: user?.formationsCount || 0,
                    icon: BookOpen,
                  },
                  {
                    label: "Apprenants",
                    value: user?.learnersCount || 0,
                    icon: User,
                  },
                  {
                    label: "Taux",
                    value: `${user?.attendanceRate || 0}%`,
                    icon: Clock,
                  },
                  { label: "Note", value: user?.rating || "4.9", icon: Star },
                ]}
              />
            </Box>

            {/* SECTION : CODE D'INVITATION (Ajout PRD) */}
            <Box
              marginHorizontal="m"
              marginTop="m"
              padding="s"
              backgroundColor="white"
              borderRadius="l"
              borderLeftWidth={4}
              borderLeftColor="primary"
            >
              <Box
                flexDirection={!user?.invitationCode ? "column" : "row"}
                justifyContent="space-between"
                marginTop="s"
                gap="l"
                width="100%"
              >
                {/* Code d'invitation */}
                <Box flex={1}>
                  <Text variant="body" color="muted">
                    Invitation
                  </Text>
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Text variant="title" color="primary">
                      {user?.invitationCode || "no invitation code"}
                    </Text>
                    <Pressable
                      onPress={() => copyToClipboard(user?.invitationCode)}
                    >
                      <Copy size={20} color="#2563EB" />
                    </Pressable>
                  </Box>
                </Box>

                {/* Code master */}
                <Box flex={1}>
                  <Text variant="body" color="muted">
                    Master
                  </Text>
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Text variant="title" color="primary">
                      {user?.masterCode || "no master code"}
                    </Text>
                    <Pressable
                      onPress={() => copyToClipboard(user?.masterCode)}
                    >
                      <Copy size={20} color="#2563EB" />
                    </Pressable>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* SECTION 1 : INFOS PERSONNELLES */}
            <Box
              marginHorizontal="m"
              marginTop="m"
              backgroundColor="white"
              borderRadius="l"
              paddingBottom="m"
            >
              <ProfileSection title="Informations Personnelles">
                <ProfileField
                  label="Nom complet"
                  value={user?.name}
                  onSave={(v) => updateField("name", v)}
                />
                <ProfileField
                  label="Email professionnel"
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
                <ProfileField
                  label="Localisation"
                  value={user?.location}
                  onSave={(v) => updateField("location", v)}
                  icon={<MapPin size={18} color="#6B7280" />}
                />
              </ProfileSection>
            </Box>

            {/* SECTION 2 : PROFIL PROFESSIONNEL (Design Carte) */}
            <Box
              marginHorizontal="m"
              marginTop="m"
              backgroundColor="white"
              borderRadius="l"
              paddingBottom="m"
            >
              <ProfileSection title="Expertise & Tarifs">
                <ProfileField
                  label="Spécialité"
                  value={user?.specialite}
                  placeholder="React Native, Web..."
                  onSave={(v) => updateField("specialite", v)}
                  icon={<Briefcase size={18} color="#6B7280" />}
                />
                <ProfileField
                  label="Tarif Journalier"
                  value={user?.tarif}
                  placeholder="Ex: 500€/jour"
                  onSave={(v) => updateField("tarif", v)}
                  icon={<DollarSign size={18} color="#6B7280" />}
                />
                <ProfileField
                  label="Bio"
                  value={user?.bio}
                  multiline
                  onSave={(v) => updateField("bio", v)}
                />
              </ProfileSection>
            </Box>

            <Box
              marginHorizontal="m"
              marginTop="m"
              backgroundColor="white"
              borderRadius="l"
              paddingBottom="m"
            >
              <ProfileSection title="Identité Visuelle (Certificats)">
                {/* Upload du Logo */}
                <Box paddingHorizontal="m" marginBottom="m">
                  <Text variant="body" color="muted" marginBottom="s">
                    Logo de l&apos;organisation (optionnel)
                  </Text>
                  <Text variant="small" color="muted" italic>
                    Ce logo apparaîtra sur les certificats de vos apprenants.
                    Idéalement au format PNG avec un fond transparent.
                  </Text>
                  <Pressable
                    onPress={() => handleLogoUpload("certificateLogo")}
                    style={({ pressed }) => ({
                      height: 100,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 12,
                      borderStyle: "dashed",
                      borderWidth: 1,
                      borderColor: "#D1D5DB",
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    {user?.certificateLogo ? (
                      <Box alignItems="center">
                        <ImageIcon size={24} color="#2563EB" />
                        <Text variant="small" color="primary" marginTop="xs">
                          Modifier le logo
                        </Text>
                      </Box>
                    ) : (
                      <Box alignItems="center">
                        <ImageIcon size={30} color="#9CA3AF" />
                        <Text variant="small" color="muted" marginTop="xs">
                          Cliquez pour uploader un logo
                        </Text>
                      </Box>
                    )}
                  </Pressable>
                </Box>

                {/* Couleur préférée pour le certificat */}
                <ProfileField
                  label="Couleur du certificat"
                  value={user?.certificateColor || "#2563EB"}
                  placeholder="Ex: #FF5733"
                  onSave={(v) => updateField("certificateColor", v)}
                  icon={
                    <Palette
                      size={18}
                      color={user?.certificateColor || "#6B7280"}
                    />
                  }
                />
              </ProfileSection>
            </Box>
            {/* notifications  */}
            {/* LIEN VERS NOTIFICATIONS */}
            <Pressable onPress={() => router.push("/settings/notifications")}>
              <Box
                marginHorizontal="m"
                marginTop="m"
                backgroundColor="white"
                borderRadius="l"
                padding="l"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box flexDirection="row" gap="m">
                  <Bell size={20} color="#6B7280" />
                  <Text variant="body">Notifications</Text>
                </Box>
                <ChevronRight size={20} color="#6B7280" />
              </Box>
            </Pressable>

            {/* SECTION 3 : SÉCURITÉ */}
            <Box
              marginHorizontal="m"
              marginTop="m"
              backgroundColor="white"
              borderRadius="l"
              padding="m"
            >
              <Text variant="body" fontWeight="700" marginBottom="m">
                Sécurité
              </Text>
              <Pressable onPress={() => router.push("/settings/security")}>
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  paddingVertical="s"
                >
                  <Box flexDirection="row" gap="m">
                    <Shield size={20} color="#6B7280" />
                    <Text variant="body">Changer le mot de passe</Text>
                  </Box>
                  <ChevronRight size={20} color="#6B7280" />
                </Box>
              </Pressable>

              {/* LIEN VERS ABOUT APP */}
              <Text variant="body" fontWeight="700" marginBottom="m">
                À propos
              </Text>
              <Pressable onPress={() => router.push("/settings/aboutApp")}>
                <Box flexDirection="row" gap="m">
                  <Briefcase size={20} color="#6B7280" />
                  <Text variant="body">À propos de l&apos;application</Text>
                </Box>
                <ChevronRight size={20} color="#6B7280" />
              </Pressable>
            </Box>

            {/* BOUTONS ACTIONS FINALES */}
            <Box padding="l" gap="m">
              {uploading && (
                <ActivityIndicator
                  color="#2563EB"
                  style={{ marginBottom: 10 }}
                />
              )}

              {/* <Button
              title="Déconnexion"
              variant="red"
              onPress={() => setLogoutModalVisible(true)}
              icon={<LogOut size={20} color="white" />}
            /> */}
            </Box>

            {/* Espace pour ne pas être collé en bas */}
            {/* <Box height={60} /> */}
          </ScrollView>

          {/* Modal de déconnexion */}
          {/* <Box padding="l">
          <LogoutButton />
        </Box> */}

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
      {/* Bouton de déconnexion draggable, en dehors du ScrollView */}
      <LogoutButton
        requireMasterCode={false} // ou true si nécessaire
        masterCode={user?.masterCode}
        onLogout={logout}
      />
    </View>
  );
}
