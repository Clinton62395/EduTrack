import { AppModal } from "@/components/modal/WrapperModal";
import { Box, Text } from "@/components/ui/theme";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Share } from "react-native";

/**
 * Hook pour copier le code d'invitation et partager la formation
 */
export function useFormationActions(user) {
  const [modalVisible, setModalVisible] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  /** 📋 Copie le code et ouvre le modal */
  const copyToClipboard = async (invitationCode) => {
    try {
      await Clipboard.setStringAsync(invitationCode);
      setCopiedCode(invitationCode);
      setModalVisible(true);
    } catch (error) {
      console.error("Erreur copie clipboard:", error);
    }
  };

  /** 🔗 Partage la formation via les options natives */
  const shareFormation = async (title, invitationCode) => {
    try {
      await Share.share({
        message: `Par ${user.name} rejoins ma formation "${title}" sur EduTrack avec le code : ${invitationCode}`,
      });
    } catch (error) {
      console.error("Erreur partage:", error.message);
    }
  };

  /** 📝 Modal de confirmation du code copié */
  const CopyModal = () => (
    <AppModal
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
      title="Copié !"
      footerActions={[
        {
          label: "OK",
          onPress: () => setModalVisible(false),
        },
      ]}
    >
      <Box>
        <Text variant="body" textAlign="center">
          Le code d'invitation <Text fontWeight="bold">{copiedCode}</Text> a été
          copié dans le presse-papier.
        </Text>
      </Box>
    </AppModal>
  );

  return { copyToClipboard, shareFormation, CopyModal };
}
