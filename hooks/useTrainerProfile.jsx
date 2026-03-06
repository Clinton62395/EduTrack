import { db } from "@/components/lib/firebase"; // Instance firestore() native
import firestore from "@react-native-firebase/firestore";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

export function useTrainerProfile(user) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState(null); // 'avatar' | 'certificateLogo'
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  // --- Helpers UI ---
  const showError = (message) =>
    setSnackbar({ visible: true, message, type: "error" });
  const showSuccess = (message) =>
    setSnackbar({ visible: true, message, type: "success" });
  const hideSnackbar = () => setSnackbar({ ...snackbar, visible: false });

  /**
   * 🔄 Mise à jour d'un champ Firestore (Natif)
   */
  const updateField = async (field, value) => {
    if (!user?.uid) return showError("Session expirée.");
    try {
      setUploading(true);
      await db
        .collection("users")
        .doc(user.uid)
        .update({
          [field]: value,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      showSuccess("Profil mis à jour !");
      return true;
    } catch (error) {
      console.error("Update Field Error:", error);
      showError("Erreur de sauvegarde Firestore.");
      return false;
    } finally {
      setUploading(false);
    }
  };

  /**
   * ☁️ Upload Cloudinary avec gestion Native du FormData
   */
  const handleImageUpload = async (type = "avatar") => {
    // 1. Permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à vos photos est nécessaire.");
      return;
    }

    // 2. Sélection de l'image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "avatar" ? [1, 1] : [4, 3],
      quality: 0.6, // Compression pour économiser de la data
    });

    if (result.canceled || !result.assets[0]) return;

    try {
      if (!user?.uid) throw new Error("No UID");

      setUploading(true);
      setUploadType(type);
      setUploadProgress(0);

      const uri = result.assets[0].uri;
      const folderPath = `Edutrack/Users/${user.uid}/${type === "avatar" ? "Profiles" : "Logos"}`;

      // 📦 Préparation du FormData (Format compatible React Native)
      const data = new FormData();
      data.append("file", {
        uri,
        type: "image/jpeg",
        name: `${type}_${Date.now()}.jpg`,
      });
      data.append("upload_preset", "edutrack_unsigned"); // Vérifie bien ton preset Cloudinary
      data.append("folder", folderPath);

      // 🚀 Envoi vers Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dhpbglioz/image/upload`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            const progress = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(progress);
          },
        },
      );

      if (response.data.secure_url) {
        const url = response.data.secure_url;
        // Mise à jour synchrone de Firestore
        await updateField(
          type === "avatar" ? "avatar" : "certificateLogo",
          url,
        );
      }
    } catch (error) {
      console.error("Upload Error:", error);
      showError("Échec de l'envoi vers le cloud.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadType(null);
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadType,
    snackbar,
    hideSnackbar,
    handlePhotoUpload: () => handleImageUpload("avatar"),
    handleLogoUpload: () => handleImageUpload("certificateLogo"),
    updateField,
    showError,
    showSuccess,
  };
}
