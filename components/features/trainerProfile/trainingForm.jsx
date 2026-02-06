import { db } from "@/components/lib/firebase";
import { router } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import {
  Award,
  BookOpen,
  Briefcase,
  Clock,
  DollarSign,
  Globe,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  Shield,
  User,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useAuthForm } from "../../../hooks/auth/fromValidator";
import { ProfileField } from "../../common/profileField";
import { ProfileHeader } from "../../common/profileHearder";
import { ProfileSection } from "../../common/profileSection";
import { ProfileStats } from "../../common/profileStact";
import { Box, Button, Text } from "../../ui/theme";

export default function TrainerProfileScreen() {
  const { user, logout } = useAuthForm();
  const [loading, setLoading] = useState(false);

  const handleUpdateField = async (field, value) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", user.id), {
        [field]: value,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert("Succès", "Profil mis à jour");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  // Données formateur spécifiques (d'après PRD)
  const trainerData = {
    specialite: user?.specialite || "",
    experience: user?.experience || "",
    tarif: user?.tarif || "",
    disponibilite: user?.disponibilite || "",
    bio: user?.bio || "",
    certifications: user?.certifications || [],
  };

  return (
    <Box flex={1} backgroundColor="background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* En-tête avec photo */}
        <ProfileHeader
          user={user}
          role="trainer"
          onEditPhoto={() => {
            // À implémenter avec expo-image-picker
            Alert.alert("Photo", "Fonctionnalité à implémenter");
          }}
        />

        {/* Statistiques Formateur */}
        <Box padding="l">
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
                label: "Taux présence",
                value: `${user?.attendanceRate || 0}%`,
                icon: Clock,
              },
              { label: "Note", value: user?.rating || "4.8", icon: Award },
            ]}
          />
        </Box>

        {/* SECTION 1 : Informations Personnelles */}
        <ProfileSection
          title="Informations Personnelles"
          actionLabel="Modifier"
        >
          <ProfileField
            label="Nom complet"
            value={user?.name}
            onSave={(value) => handleUpdateField("name", value)}
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
            placeholder="Ajouter un numéro"
            keyboardType="phone-pad"
            onSave={(value) => handleUpdateField("phone", value)}
            icon={<Phone size={18} color="#6B7280" />}
          />
          <ProfileField
            label="Localisation"
            value={user?.location}
            placeholder="Ville, Pays"
            onSave={(value) => handleUpdateField("location", value)}
            icon={<MapPin size={18} color="#6B7280" />}
          />
        </ProfileSection>

        {/* SECTION 2 : Profil Professionnel (Spécifique Formateur) */}
        <ProfileSection title="Profil Professionnel">
          <ProfileField
            label="Spécialité"
            value={trainerData.specialite}
            placeholder="Ex: React Native, UX Design"
            onSave={(value) => handleUpdateField("specialite", value)}
            icon={<Briefcase size={18} color="#6B7280" />}
          />
          <ProfileField
            label="Expérience"
            value={trainerData.experience}
            placeholder="Ex: 5 ans dans le développement"
            onSave={(value) => handleUpdateField("experience", value)}
            multiline
            icon={<Award size={18} color="#6B7280" />}
          />
          <ProfileField
            label="Tarif"
            value={trainerData.tarif}
            placeholder="Ex: 40€/heure ou Sur devis"
            onSave={(value) => handleUpdateField("tarif", value)}
            icon={<DollarSign size={18} color="#6B7280" />}
          />
          <ProfileField
            label="Disponibilités"
            value={trainerData.disponibilite}
            placeholder="Ex: Lundi-Vendredi 9h-18h"
            onSave={(value) => handleUpdateField("disponibilite", value)}
            icon={<Clock size={18} color="#6B7280" />}
          />
          <ProfileField
            label="Bio/Description"
            value={trainerData.bio}
            placeholder="Décrivez votre parcours et approche pédagogique..."
            onSave={(value) => handleUpdateField("bio", value)}
            multiline
            icon={<BookOpen size={18} color="#6B7280" />}
          />
        </ProfileSection>

        {/* SECTION 3 : Liens & Réseaux */}
        <ProfileSection title="Liens & Réseaux">
          <ProfileField
            label="Site web"
            value={user?.website}
            placeholder="https://votresite.com"
            keyboardType="url"
            onSave={(value) => handleUpdateField("website", value)}
            icon={<Globe size={18} color="#6B7280" />}
          />
          <ProfileField
            label="LinkedIn"
            value={user?.linkedin}
            placeholder="https://linkedin.com/in/votrenom"
            keyboardType="url"
            onSave={(value) => handleUpdateField("linkedin", value)}
          />
          <ProfileField
            label="Portfolio"
            value={user?.portfolio}
            placeholder="Lien vers votre portfolio"
            keyboardType="url"
            onSave={(value) => handleUpdateField("portfolio", value)}
          />
        </ProfileSection>

        {/* SECTION 4 : Certifications (Formateur) */}
        {trainerData.certifications?.length > 0 && (
          <ProfileSection title="Certifications">
            {trainerData.certifications.map((cert, index) => (
              <Box
                key={index}
                padding="m"
                borderBottomWidth={1}
                borderBottomColor="border"
              >
                <Text variant="body">{cert}</Text>
              </Box>
            ))}
            <Pressable onPress={() => Alert.alert("Ajouter certification")}>
              <Box padding="m" alignItems="center">
                <Text variant="body" color="primary">
                  + Ajouter une certification
                </Text>
              </Box>
            </Pressable>
          </ProfileSection>
        )}

        {/* SECTION 5 : Sécurité & Compte */}
        <ProfileSection title="Sécurité & Compte" showDivider={false}>
          <Pressable onPress={() => router.push("/settings/security")}>
            <Box
              padding="m"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box flexDirection="row" alignItems="center" gap="m">
                <Shield size={20} color="#6B7280" />
                <Text variant="body">Sécurité du compte</Text>
              </Box>
              <ChevronRight size={20} color="#6B7280" />
            </Box>
          </Pressable>

          <Pressable onPress={() => router.push("/settings/notifications")}>
            <Box
              padding="m"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box flexDirection="row" alignItems="center" gap="m">
                <Bell size={20} color="#6B7280" />
                <Text variant="body">Notifications</Text>
              </Box>
              <ChevronRight size={20} color="#6B7280" />
            </Box>
          </Pressable>
        </ProfileSection>

        {/* Boutons d'action */}
        <Box padding="xl" gap="m">
          <Button
            title="Enregistrer les modifications"
            onPress={() => Alert.alert("Enregistré", "Profil mis à jour")}
            loading={loading}
            disabled={loading}
          />

          <Button
            title="Déconnexion"
            onPress={handleLogout}
            variant="outline"
            icon={<LogOut size={20} color="#DC2626" />}
          />

          <Button
            title="Paramètres avancés"
            onPress={() => router.push("/settings")}
            variant="secondary"
            icon={<Settings size={20} color="#6B7280" />}
          />
        </Box>
      </ScrollView>
    </Box>
  );
}
