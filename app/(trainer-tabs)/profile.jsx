import { Snack } from "@/components/ui/snackbar";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  serverTimestamp,
  uploadBytes,
} from "firebase/storage";
import {
  BookOpen,
  Briefcase,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  User,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView } from "react-native";

import { ProfileField } from "@/components/common/profileField";
import { ProfileHeader } from "@/components/common/profileHearder";
import { ProfileSection } from "@/components/common/profileSection";
import { ProfileStats } from "@/components/common/useProfile";
import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firabase";
import { Box, Button, Text } from "@/components/ui/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTrainerProfile } from "../../components/hooks/useTrainerProfile";

export default function TrainerProfileScreen() {
  const { user, logout } = useAuth();
  const {
    uploading,
    snackbar,
    hideSnackbar,
    uploadPhoto,
    updateField,
    confirmLogout,
  } = useTrainerProfile(user, logout);
  return (
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
            padding="m"
            backgroundColor="white"
            borderRadius="l"
            borderLeftWidth={4}
            borderLeftColor="primary"
          >
            <Text variant="caption" color="muted">
              Mon Code d'Invitation Maître
            </Text>
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginTop="s"
            >
              <Text variant="title" color="primary">
                {user?.masterCode || "TRAIN-2024"}
              </Text>
              <Pressable onPress={() => Alert.alert("Copié !")}>
                <Copy size={20} color="#2563EB" />
              </Pressable>
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
                onSave={(v) => handleUpdateField("name", v)}
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
                placeholder="+33 6..."
                onSave={(v) => handleUpdateField("phone", v)}
                icon={<Phone size={18} color="#6B7280" />}
              />
              <ProfileField
                label="Localisation"
                value={user?.location}
                onSave={(v) => handleUpdateField("location", v)}
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
                onSave={(v) => handleUpdateField("specialite", v)}
                icon={<Briefcase size={18} color="#6B7280" />}
              />
              <ProfileField
                label="Tarif Journalier"
                value={user?.tarif}
                placeholder="Ex: 500€/jour"
                onSave={(v) => handleUpdateField("tarif", v)}
                icon={<DollarSign size={18} color="#6B7280" />}
              />
              <ProfileField
                label="Bio"
                value={user?.bio}
                multiline
                onSave={(v) => handleUpdateField("bio", v)}
              />
            </ProfileSection>
          </Box>

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
          </Box>

          {/* BOUTONS ACTIONS FINALES */}
          <Box padding="l" gap="m">
            {uploading && (
              <ActivityIndicator color="#2563EB" style={{ marginBottom: 10 }} />
            )}
            <Button
              title="Déconnexion"
              onPress={handleLogout}
              variant="outline"
              icon={<LogOut size={20} color="#DC2626" />}
            />
          </Box>

          {/* Espace pour ne pas être collé en bas */}
          <Box height={50} />
        </ScrollView>
        {showSnackbar && (
          <Snack
            visible={showSnackbar}
            onDismiss={() => setShowSnackbar(false)}
            error={errorMessage}
          />
        )}
      </SafeAreaView>
    </Box>
  );
}
