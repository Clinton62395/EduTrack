import { Box, Text } from "@/components/ui/theme";
import {
  Calendar,
  ChevronRight,
  Eye,
  EyeOff,
  MoreVertical,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react-native";
import { Alert, TouchableOpacity, View } from "react-native";

// ─────────────────────────────────────────
// Helpers statut
// ─────────────────────────────────────────
const STATUS_CONFIG = {
  draft: { label: "Brouillon", color: "#6B7280", bg: "#F3F4F6" },
  published: { label: "Publiée", color: "#10B981", bg: "#ECFDF5" },
  archived: { label: "Archivée", color: "#9CA3AF", bg: "#F9FAFB" },
};

const SESSION_CONFIG = {
  planned: { label: "À venir", color: "#F59E0B" },
  ongoing: { label: "En cours", color: "#3B82F6" },
  completed: { label: "Terminée", color: "#6B7280" },
};

export function TrainingCards({
  formation,
  onPress,
  onOptionsPress,
  onPublish,
  onUnpublish,
  showActions = true,
}) {
  const statusConfig = STATUS_CONFIG[formation.status] || STATUS_CONFIG.draft;
  const sessionConfig =
    SESSION_CONFIG[formation.sessionStatus] || SESSION_CONFIG.planned;

  const isPublished = formation.status === "published";
  const isDraft = formation.status === "draft";

  const handleShareCode = () => {
    Alert.alert(
      "Code d'invitation",
      `Code : ${formation.invitationCode}\n\nPartagez ce code avec vos apprenants.`,
      [
        {
          text: "Copier",
          onPress: () =>
            Alert.alert("Copié !", "Code copié dans le presse-papier"),
        },
        { text: "OK" },
      ],
    );
  };

  const handlePublishPress = () => {
    Alert.alert(
      "Publier la formation ?",
      "Le code d'invitation sera activé et vos apprenants pourront rejoindre.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Publier", onPress: () => onPublish?.(formation.id) },
      ],
    );
  };

  const handleUnpublishPress = () => {
    Alert.alert(
      "Dépublier la formation ?",
      "Le code d'invitation sera désactivé. Les apprenants déjà inscrits gardent leur accès.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Dépublier",
          style: "destructive",
          onPress: () => onUnpublish?.(formation.id),
        },
      ],
    );
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Box
        backgroundColor="white"
        borderRadius="l"
        borderWidth={1}
        borderColor="border"
        marginBottom="m"
        overflow="hidden"
        shadowColor="overlayDark"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.05}
        shadowRadius={8}
      >
        {/* Barre de couleur selon statut */}
        <Box height={4} style={{ backgroundColor: statusConfig.color }} />

        <Box padding="m">
          {/* Ligne 1 : Titre + badges statut */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
            marginBottom="s"
          >
            <Box flex={1} marginRight="s">
              <Text variant="subtitle" fontWeight="600" numberOfLines={1}>
                {formation.title}
              </Text>
              <Text variant="caption" color="muted" numberOfLines={1}>
                {formation.category}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center" gap="xs">
              {/* Badge statut métier */}
              <View
                style={{
                  backgroundColor: statusConfig.bg,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}
              >
                <Text
                  variant="caption"
                  fontWeight="600"
                  style={{ color: statusConfig.color }}
                >
                  {statusConfig.label}
                </Text>
              </View>

              {/* Badge sessionStatus (dates) — uniquement si published */}
              {isPublished && (
                <View
                  style={{
                    backgroundColor: `${sessionConfig.color}15`,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    variant="caption"
                    fontWeight="500"
                    style={{ color: sessionConfig.color }}
                  >
                    {sessionConfig.label}
                  </Text>
                </View>
              )}

              {showActions && onOptionsPress && (
                <TouchableOpacity onPress={onOptionsPress}>
                  <MoreVertical size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </Box>
          </Box>

          {/* Description */}
          <Text variant="body" color="text" numberOfLines={2} marginBottom="m">
            {formation.description}
          </Text>

          {/* Statistiques */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            marginBottom="m"
          >
            <Box flexDirection="row" alignItems="center" gap="xs">
              <Users size={16} color="#6B7280" />
              <Text variant="caption" color="muted">
                {formation.currentLearners || 0}/{formation.maxLearners}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center" gap="xs">
              <Calendar size={16} color="#6B7280" />
              <Text variant="caption" color="muted">
                {formation.schedule || "—"}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center" gap="xs">
              <TrendingUp size={16} color="#6B7280" />
              <Text variant="caption" color="muted">
                {formation.progressionRate || 0}%
              </Text>
            </Box>
          </Box>

          {/* Actions */}
          {showActions && (
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginTop="s"
              paddingTop="s"
              borderTopWidth={1}
              borderTopColor="secondaryBackground"
            >
              {/* Gauche : code d'invitation OU bouton publier */}
              {isPublished ? (
                <TouchableOpacity onPress={handleShareCode}>
                  <Box flexDirection="row" alignItems="center" gap="xs">
                    <Box
                      backgroundColor="primary"
                      paddingHorizontal="s"
                      paddingVertical="xs"
                      borderRadius="s"
                    >
                      <Text variant="caption" color="white" fontWeight="700">
                        {formation.invitationCode}
                      </Text>
                    </Box>
                    <Share2 size={14} color="#6B7280" />
                  </Box>
                </TouchableOpacity>
              ) : (
                // Draft → bouton Publier
                <TouchableOpacity onPress={handlePublishPress}>
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    gap="xs"
                    backgroundColor="primary"
                    paddingHorizontal="m"
                    paddingVertical="xs"
                    borderRadius="s"
                  >
                    <Eye size={14} color="white" />
                    <Text variant="caption" color="white" fontWeight="600">
                      Publier
                    </Text>
                  </Box>
                </TouchableOpacity>
              )}

              {/* Droite : Dépublier (si published) ou Voir détails */}
              <Box flexDirection="row" alignItems="center" gap="m">
                {isPublished && (
                  <TouchableOpacity onPress={handleUnpublishPress}>
                    <Box flexDirection="row" alignItems="center" gap="xs">
                      <EyeOff size={14} color="#9CA3AF" />
                      <Text variant="caption" color="muted">
                        Dépublier
                      </Text>
                    </Box>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={onPress}>
                  <Box flexDirection="row" alignItems="center" gap="xs">
                    <Text variant="action">Voir détails</Text>
                    <ChevronRight size={16} color="#3B82F6" />
                  </Box>
                </TouchableOpacity>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </TouchableOpacity>
  );
}
