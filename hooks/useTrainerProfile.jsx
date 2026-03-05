import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";
// firestore methods used via db; FieldValue from firestore

export function useTrainerProfile(user, logout) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState(null);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showError = (message) =>
    setSnackbar({ visible: true, message, type: "error" });
  const showSuccess = (message) =>
    setSnackbar({ visible: true, message, type: "success" });
  const hideSnackbar = () =>
    setSnackbar({ visible: false, message: "", type: "success" });

  // 🔄 Mise à jour d'un champ Firestore
  const updateField = async (field, value) => {
    if (!user?.uid) return showError("Utilisateur non authentifié.");
    try {
      setUploading(true);
      await db
        .collection("users")
        .doc(user.uid)
        .update({
          [field]: value,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      showSuccess(`Mise à jour réussie !`);
    } catch (error) {
      showError("Erreur lors de la mise à jour.");
    } finally {
      setUploading(false);
    }
  };

  /**
   * ☁️ Fonction générique d'upload vers Cloudinary
   * @param {string} type - 'avatar' ou 'certificateLogo'
   */
  const handleImageUpload = async (type = "avatar") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission", "Accès à la galerie requis.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // On garde un carré pour l'avatar, mais on peut être plus libre pour un logo
      aspect: type === "avatar" ? [1, 1] : [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      try {
        if (!user?.uid) return showError("Utilisateur non authentifié.");

        setUploading(true);
        const uri = result.assets[0].uri;
        setUploadProgress(0);
        setUploadType(type);

        // Configuration dynamique selon le type
        const folderPath =
          type === "avatar"
            ? `Edutrack/${user.role}/Profiles`
            : `Edutrack/${user.role}/Logos`;

        const fileName = `${type}_${user.uid}.jpg`;

        const data = new FormData();
        data.append("file", { uri, type: "image/jpeg", name: fileName });
        data.append("upload_preset", "edutrack_unsigned");
        data.append("cloud_name", "dhpbglioz");
        data.append("folder", folderPath);

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dhpbglioz/image/upload",
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setUploadProgress(percent);
            },
          },
        );

        if (response.data.secure_url) {
          const uploadedUrl = response.data.secure_url;
          // Met à jour soit le champ 'avatar' soit 'certificateLogo' dans Firestore
          await updateField(type, uploadedUrl);
          showSuccess(
            type === "avatar"
              ? "Photo de profil mise à jour !"
              : "Logo mis à jour !",
          );
        }
      } catch (error) {
        console.error("Cloudinary Error:", error);
        showError("L'envoi a échoué.");
      } finally {
        setUploading(false);
        setUploadProgress(0);
        setUploadType(null);
      }
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadType,
    snackbar,
    hideSnackbar,
    handlePhotoUpload: () => handleImageUpload("avatar"), // Pour le Header
    handleLogoUpload: () => handleImageUpload("certificateLogo"), // Pour les Certificats
    updateField,
    showError,
    showSuccess,
  };
}
