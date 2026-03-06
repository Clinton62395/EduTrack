import { Box, Text } from "@/components/ui/theme";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  PlayCircle,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity } from "react-native";

export function LessonItem({
  lesson,
  isLast,
  onDownload,
  isDownloading,
  getLocalUri,
}) {
  const [localPath, setLocalPath] = useState(null);

  // Définition des types
  const isDocument = lesson.type === "pdf" || lesson.type === "document";
  const isVideo = lesson.type === "video";
  const isQuiz = lesson.type === "quiz";

  // 🎯 On utilise 'content' comme source unique de vérité pour l'URL
  const remoteUrl = lesson.content;

  useEffect(() => {
    // On vérifie si le fichier PDF existe localement au chargement
    if (isDocument && remoteUrl && remoteUrl.startsWith("http")) {
      const path = getLocalUri(lesson.id, remoteUrl);
      FileSystem.getInfoAsync(path).then((info) => {
        if (info.exists) setLocalPath(info.uri);
      });
    }
  }, [lesson.id, isDocument, remoteUrl]);

  
  const handlePress = async () => {
    if (isDocument) {
      if (localPath) {
        // ✅ Utilise Sharing au lieu de Linking
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(localPath, {
            mimeType: "application/pdf", // Force le type PDF
            dialogTitle: `Lire : ${lesson.title}`,
          });
        } else {
          Alert.alert(
            "Erreur",
            "Le partage de fichiers n'est pas disponible sur cet appareil.",
          );
        }
      } else if (remoteUrl) {
        // ... logique de téléchargement inchangée ...
        try {
          const uri = await onDownload(lesson.id, remoteUrl);
          if (uri) setLocalPath(uri);
        } catch (e) {
          Alert.alert("Erreur", "Le téléchargement a échoué.");
        }
      }
    }
    // ... reste du code ...
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isDownloading}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        paddingVertical="m"
        paddingHorizontal="m"
        borderBottomWidth={isLast ? 0 : 1}
        borderBottomColor="secondaryBackground"
      >
        {/* Icône à gauche */}
        <Box
          width={40}
          height={40}
          borderRadius="m"
          backgroundColor={
            localPath
              ? "successLight"
              : isDocument
                ? "primaryLight"
                : "secondaryBackground"
          }
          justifyContent="center"
          alignItems="center"
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : localPath ? (
            <CheckCircle2 size={20} color="#10B981" />
          ) : isVideo ? (
            <PlayCircle size={20} color="#6B7280" />
          ) : isQuiz ? (
            <HelpCircle size={20} color="#6B7280" />
          ) : (
            <FileText size={20} color={isDocument ? "#2563EB" : "#9CA3AF"} />
          )}
        </Box>

        {/* Texte central */}
        <Box flex={1} marginLeft="m">
          <Text variant="body" numberOfLines={1} fontWeight="600">
            {lesson.title}
          </Text>
          <Text variant="caption" color={localPath ? "success" : "muted"}>
            {localPath
              ? "Téléchargé"
              : isDocument
                ? "Document PDF"
                : `Leçon ${lesson.type}`}
          </Text>
        </Box>

        {/* Action à droite */}
        {isDocument && !localPath && !isDownloading && (
          <Download size={18} color="#2563EB" />
        )}
      </Box>
    </TouchableOpacity>
  );
}
