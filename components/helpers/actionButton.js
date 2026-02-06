import * as Clipboard from "expo-clipboard";
import { Alert, Share } from "react-native";

/**
 * Copie le code d'invitation dans le presse-papier
 * @param {string} invitationCode
 */
export const copyToClipboard = async (invitationCode) => {
  try {
    await Clipboard.setStringAsync(invitationCode);
    Alert.alert(
      "Copié !",
      "Le code d'invitation a été copié dans le presse-papier.",
    );
  } catch (error) {
    console.error("Erreur copie clipboard:", error);
  }
};

/**
 * Partage la formation via les options natives
 * @param {string} title - titre de la formation
 * @param {string} invitationCode - code d'invitation
 */
export const shareFormation = async (title, invitationCode) => {
  try {
    await Share.share({
      message: `Rejoins ma formation "${title}" sur EduTrack avec le code : ${invitationCode}`,
    });
  } catch (error) {
    console.error("Erreur partage:", error.message);
  }
};
