import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const useMediaPicker = () => {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Nous avons besoin d'accéder à vos photos.",
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      return { uri: result.assets[0].uri, type: "image" };
    }
    return null;
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission refusée", "L'accès à la caméra est nécessaire.");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      return { uri: result.assets[0].uri, type: "image" };
    }
    return null;
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf", // Tu peux mettre '*/*' pour tout accepter
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      return {
        uri: result.assets[0].uri,
        type: "file",
        name: result.assets[0].name,
      };
    }
    return null;
  };

  return { pickImage, takePhoto, pickDocument };
};
