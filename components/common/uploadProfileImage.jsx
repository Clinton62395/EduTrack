// components/profile/AvatarUploader.jsx
import { db, storage } from "@/components/lib/firebase";
import { Box, Text } from "@/components/ui/theme";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Camera, Loader2, User } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity } from "react-native";

export function AvatarUploader({
  currentAvatar,
  userId,
  onAvatarChange,
  size = 120,
  editable = true,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadToFirebase = async (uri) => {
    try {
      setUploading(true);

      // Convertir URI en blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Créer une référence Firebase Storage
      const filename = `avatars/${userId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      // Upload avec suivi de progression
      const uploadTask = uploadBytes(storageRef, blob);

      // Écouter la progression (optionnel)
      // uploadTask.on('state_changed',
      //   (snapshot) => {
      //     const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      //     setUploadProgress(progress);
      //   }
      // );

      // Attendre la fin de l'upload
      await uploadTask;

      // Récupérer l'URL de téléchargement
      const downloadURL = await getDownloadURL(storageRef);

      // Mettre à jour Firestore
      await updateDoc(doc(db, "users", userId), {
        avatar: downloadURL,
        updatedAt: new Date().toISOString(),
      });

      if (onAvatarChange) {
        onAvatarChange(downloadURL);
      }

      Alert.alert("Succès", "Photo de profil mise à jour !");
      return downloadURL;
    } catch (error) {
      console.error("Erreur upload:", error);
      Alert.alert("Erreur", "Impossible de télécharger l'image");
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePickImage = async () => {
    if (!editable || uploading) return;

    // Demander la permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "EduTrack a besoin d'accéder à vos photos.",
      );
      return;
    }

    // Menu de choix
    Alert.alert("Changer la photo", "Choisissez une source", [
      {
        text: "Prendre une photo",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });

          if (!result.canceled) {
            const uploadedUrl = await uploadToFirebase(result.assets[0].uri);
            return uploadedUrl;
          }
        },
      },
      {
        text: "Choisir dans la galerie",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });

          if (!result.canceled) {
            const uploadedUrl = await uploadToFirebase(result.assets[0].uri);
            return uploadedUrl;
          }
        },
      },
      {
        text: "Annuler",
        style: "cancel",
      },
    ]);
  };

  return (
    <Box alignItems="center" position="relative">
      {/* Avatar */}
      <TouchableOpacity
        onPress={handlePickImage}
        disabled={!editable || uploading}
        activeOpacity={0.8}
      >
        <Box
          width={size}
          height={size}
          borderRadius="rounded"
          backgroundColor="background"
          alignItems="center"
          justifyContent="center"
          borderWidth={3}
          borderColor={editable ? "primary" : "border"}
          overflow="hidden"
          position="relative"
        >
          {/* Image ou placeholder */}
          {currentAvatar ? (
            <Image
              source={{ uri: currentAvatar }}
              style={{
                width: size - 6,
                height: size - 6,
                borderRadius: (size - 6) / 2,
              }}
              contentFit="cover"
            />
          ) : (
            <User size={size * 0.4} color="#6B7280" />
          )}

          {/* Overlay pendant upload */}
          {uploading && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="overlayDark"
              alignItems="center"
              justifyContent="center"
              borderRadius="rounded"
            >
              <ActivityIndicator size="large" color="white" />
              {uploadProgress > 0 && (
                <Text variant="caption" color="white" marginTop="s">
                  {Math.round(uploadProgress)}%
                </Text>
              )}
            </Box>
          )}
        </Box>
      </TouchableOpacity>

      {/* Bouton modifier (seulement si editable) */}
      {editable && !uploading && (
        <TouchableOpacity
          onPress={handlePickImage}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "#2563EB",
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Camera size={18} color="white" />
        </TouchableOpacity>
      )}

      {/* État upload */}
      {uploading && (
        <Box
          backgroundColor="background"
          paddingHorizontal="m"
          paddingVertical="s"
          borderRadius="m"
          marginTop="s"
          flexDirection="row"
          alignItems="center"
          gap="s"
        >
          <Loader2
            size={16}
            color="#2563EB"
            style={{ transform: [{ rotate: "90deg" }] }}
          />
          <Text variant="caption" color="primary">
            Téléchargement...
          </Text>
        </Box>
      )}
    </Box>
  );
}
