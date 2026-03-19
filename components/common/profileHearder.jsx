import { Box, Text } from "@/components/ui/theme";
import { Image } from "expo-image";
import { Camera, User } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

export function ProfileHeader({
  user,
  role,
  onEditPhoto,
  uploading,
  progress,
  glass,
}) {
  const backgroundColor = glass ? "rgba(255,255,255,0.6)" : "white";
  const borderBottomColor = glass ? "rgba(255,255,255,0.35)" : "border";
  const borderBottomWidth = glass ? 0 : 1;

  return (
    <Box
      alignItems="center"
      padding="xl"
      backgroundColor={backgroundColor}
      borderBottomWidth={borderBottomWidth}
      borderBottomColor={borderBottomColor}
    >
      <Box position="relative" marginBottom="m">
        <Pressable onPress={onEditPhoto} disabled={uploading}>
          <Box
            width={120}
            height={120}
            borderRadius="rounded"
            backgroundColor="secondaryBackground"
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor={uploading ? "primary" : "border"}
            overflow="hidden"
          >
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 120, height: 120 }}
              />
            ) : (
              <User size={40} color="black" />
            )}

            {/* OVERLAY DE CHARGEMENT & POURCENTAGE */}
            {uploading && (
              <Box
                style={StyleSheet.absoluteFill}
                backgroundColor="black"
                opacity={0.6}
                justifyContent="center"
                alignItems="center"
              >
                <ActivityIndicator color="white" size="small" />
                <Text
                  color="white"
                  variant="caption"
                  fontWeight="bold"
                  marginTop="xs"
                >
                  {progress}%
                </Text>
              </Box>
            )}

            {/* Overlay Camera (si pas d'upload en cours) */}
            {!uploading && (
              <Box
                position="absolute"
                bottom={0}
                backgroundColor="black"
                opacity={0.3}
                width="100%"
                height={30}
                alignItems="center"
                justifyContent="center"
              >
                <Camera size={14} color="white" />
              </Box>
            )}
          </Box>
        </Pressable>

        {/* Badge Rôle */}
        <Box
          position="absolute"
          bottom={0}
          right={0}
          backgroundColor="secondary"
          paddingHorizontal="s"
          paddingVertical="xs"
          borderRadius="s"
        >
          <Text variant="caption" color="white" fontWeight="600">
            {role === "trainer" ? "Formateur" : "apprenant"}
          </Text>
        </Box>
      </Box>

      <Text variant="title" textAlign="center">
        {user?.name}
      </Text>
      <Text variant="body" color="muted" textAlign="center">
        {user?.email}
      </Text>
    </Box>
  );
}
