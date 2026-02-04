// components/profile/ProfileHeader.jsx
import { Box, Text } from "@/components/ui/theme";
import { Award, Camera } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import { AvatarUploader } from "./uploadProfileImage";

export function ProfileHeader({ user, role, onEditPhoto, onAvatarChanged }) {
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar);

  const handleAvatarChange = async (newAvatar) => {
    setAvatarUrl(newAvatar);
    if (onAvatarChanged) {
      onAvatarChanged(newAvatar);
    }
  };
  const getRoleLabel = () => {
    switch (role) {
      case "trainer":
        return "Formateur";
      case "admin":
        return "Admin";
      case "learner":
        return "Apprenant";
      default:
        return "Utilisateur";
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "trainer":
        return "secondary";
      case "admin":
        return "primary";
      case "learner":
        return "info";
      default:
        return "muted";
    }
  };

  return (
    <Box
      alignItems="center"
      padding="xl"
      backgroundColor="white"
      borderBottomWidth={1}
      borderBottomColor="border"
    >
      {/* Avatar avec badge */}
      <Box position="relative" marginBottom="m">
        <Box
          width={120}
          height={120}
          borderRadius="rounded"
          backgroundColor="background"
          alignItems="center"
          justifyContent="center"
          borderWidth={2}
          borderColor="border"
        >
          <AvatarUploader
            currentAvatar={avatarUrl}
            userId={user?.id}
            onAvatarChange={handleAvatarChange}
            size={120}
            editable={true}
          />
        </Box>

        {/* Badge rôle */}
        <Box
          position="absolute"
          bottom={0}
          right={0}
          backgroundColor={getRoleColor()}
          paddingHorizontal="s"
          paddingVertical="xs"
          borderRadius="s"
          flexDirection="row"
          alignItems="center"
          gap="xs"
        >
          <Award size={12} color="white" />
          <Text variant="caption" color="white" fontWeight="600">
            {getRoleLabel()}
          </Text>
        </Box>

        {/* Bouton modifier photo */}
        {onEditPhoto && (
          <Pressable
            onPress={onEditPhoto}
            style={{ position: "absolute", bottom: 0, left: 0 }}
          >
            <Box backgroundColor="primary" padding="s" borderRadius="rounded">
              <Camera size={16} color="white" />
            </Box>
          </Pressable>
        )}
      </Box>

      {/* Nom et email */}
      <Text variant="title" textAlign="center" marginBottom="xs">
        {user?.name || "Nom non défini"}
      </Text>

      <Text variant="body" color="muted" textAlign="center">
        {user?.email || "email@example.com"}
      </Text>

      {/* Spécialité pour formateur */}
      {role === "trainer" && user?.specialite && (
        <Box
          backgroundColor="background"
          paddingHorizontal="m"
          paddingVertical="s"
          borderRadius="m"
          marginTop="s"
        >
          <Text variant="caption" color="primary" fontWeight="600">
            🎯 {user.specialite}
          </Text>
        </Box>
      )}
    </Box>
  );
}
