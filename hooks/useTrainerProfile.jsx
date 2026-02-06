import { db } from "@/components/lib/firebase";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert } from "react-native";

export function useTrainerProfile(user, logout) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    type: "success", // "success" ou "error"
  });

  // ⚠️ Afficher une erreur
  const showError = (message) =>
    setSnackbar({ visible: true, message, type: "error" });

  // ✅ Afficher un succès
  const showSuccess = (message) =>
    setSnackbar({ visible: true, message, type: "success" });

  const hideSnackbar = () =>
    setSnackbar({ visible: false, message: "", type: "success" });

  // 🔄 Mise à jour d'un champ utilisateur dans Firestore
  const updateField = async (field, value) => {
    try {
      setUploading(true);
      await updateDoc(doc(db, "users", user.uid), {
        [field]: value,
        updatedAt: serverTimestamp(),
      });
      showSuccess(`${field} mis à jour !`);
    } catch (error) {
      console.error("Firestore Update Error:", error);
      showError("Impossible de mettre à jour le profil.");
    } finally {
      setUploading(false);
    }
  };

  // 📷 Upload de photo via Cloudinary
  const handlePhotoUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission", "Accès à la galerie requis.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      try {
        setUploading(true);
        const uri = result.assets[0].uri;
        setUploadProgress(0);

        const data = new FormData();
        data.append("file", {
          uri,
          type: "image/jpeg",
          name: `avatar_${user.uid}.jpg`,
        });
        data.append("upload_preset", "edutrack_unsigned");
        data.append("cloud_name", "dhpbglioz");
        data.append("folder", "Edutrack");

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dhpbglioz/image/upload",
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setUploadProgress(percentCompleted);
            },
          },
        );

        if (response.data.secure_url) {
          const photoURL = response.data.secure_url;
          await updateField("photoURL", photoURL);
          showSuccess("Photo de profil mise à jour !");
        }
      } catch (error) {
        console.error(
          "Cloudinary Error:",
          error.response?.data || error.message,
        );
        showError(
          "L'envoi a échoué. Vérifiez que votre preset 'edutrack_unsigned' est en mode 'Unsigned'.",
        );
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  // 🚪 Déconnexion avec confirmation
  const confirmLogout = (onConfirm) => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment quitter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnexion", style: "destructive", onPress: onConfirm },
    ]);
  };

  return {
    uploading,
    uploadProgress,
    snackbar,
    hideSnackbar,
    handlePhotoUpload,
    updateField,
    confirmLogout,
    showError,
    showSuccess,
  };
}
