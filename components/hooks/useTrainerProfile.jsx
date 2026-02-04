import { db } from "@/components/lib/firabase";
import * as ImagePicker from "expo-image-picker";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { Alert } from "react-native";

export function useTrainerProfile(user, logout) {
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
  });

  const showError = (message) => {
    setSnackbar({ visible: true, message });
  };

  const hideSnackbar = () => {
    setSnackbar({ visible: false, message: "" });
  };

  // 🔄 Mise à jour d'un champ utilisateur
  const updateField = async (field, value) => {
    try {
      setUploading(true);
      await updateDoc(doc(db, "users", user.uid), {
        [field]: value,
        updatedAt: serverTimestamp(),
      });
    } catch {
      showError("Impossible de mettre à jour le profil.");
    } finally {
      setUploading(false);
    }
  };

  // 📷 Upload photo de profil
  const uploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      showError("L'accès à la galerie est nécessaire.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (result.canceled) return;

    try {
      setUploading(true);
      const uri = result.assets[0].uri;

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new Error("Upload échoué"));
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const storageRef = ref(getStorage(), `avatars/${user.uid}`);
      const uploadResult = await uploadBytes(storageRef, blob);
      blob.close();

      const photoURL = await getDownloadURL(uploadResult.ref);
      await updateField("photoURL", photoURL);
    } catch {
      showError("Échec du téléchargement de la photo.");
    } finally {
      setUploading(false);
    }
  };

  // 🚪 Déconnexion
  const confirmLogout = (onConfirm) => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment quitter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: onConfirm,
      },
    ]);
  };

  return {
    uploading,
    snackbar,
    hideSnackbar,
    uploadPhoto,
    updateField,
    confirmLogout,
  };
}
