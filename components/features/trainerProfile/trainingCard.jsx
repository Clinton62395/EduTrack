import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { Snack } from "@/components/ui/snackbar";
import { Box, Text } from "@/components/ui/theme";
import * as Clipboard from "expo-clipboard";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Calendar,
  ChevronRight,
  Eye,
  EyeOff,
  MoreVertical,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { TrainingSchedule } from "../../helpers/timeFormatter";

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
  onArchive,
  onUnarchive,
  showActions = true,
}) {
  const statusConfig = STATUS_CONFIG[formation.status] || STATUS_CONFIG.draft;
  const sessionConfig =
    SESSION_CONFIG[formation.sessionStatus] || SESSION_CONFIG.planned;

  const isPublished = formation.status === "published";
  const isDraft = formation.status === "draft";
  const isArchived = formation.status === "archived";

  // ✅ Bannière d'alerte : formation publiée dont la date est dépassée
  const isExpired = isPublished && formation.sessionStatus === "completed";

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: "",
    message: "",
    confirmLabel: "Confirmer",
    cancelLabel: "Annuler",
    danger: false,
    onConfirm: async () => {},
  });

  const [snack, setSnack] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showSnack = (message, type = "success") => {
    setSnack({ visible: true, message, type });
  };

  const dismissSnack = () => {
    setSnack((prev) => ({ ...prev, visible: false }));
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, visible: false }));
  };

  const openConfirmModal = ({
    title,
    message,
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    danger = false,
    onConfirm = async () => {},
  }) => {
    setConfirmModal({
      visible: true,
      title,
      message,
      confirmLabel,
      cancelLabel,
      danger,
      onConfirm,
    });
  };

  const handleShareCode = () => {
    openConfirmModal({
      title: "Code d'invitation",
      message: `Code : ${formation.invitationCode}\n\nPartagez ce code avec vos apprenants.`,
      confirmLabel: "Copier",
      cancelLabel: "Fermer",
      danger: false,
      onConfirm: async () => {
        try {
          await Clipboard.setStringAsync(formation.invitationCode);
          showSnack("Code d'invitation copié !", "success");
        } catch (error) {
          console.error("Erreur copie clipboard:", error);
          showSnack("Échec de la copie. Réessayez.", "error");
        } finally {
          closeConfirmModal();
        }
      },
    });
  };

  const handlePublishPress = () => {
    openConfirmModal({
      title: "Publier la formation ?",
      message:
        "Le code d'invitation sera activé et vos apprenants pourront rejoindre.",
      confirmLabel: "Publier",
      cancelLabel: "Annuler",
      danger: false,
      onConfirm: async () => {
        await onPublish?.(formation.id);
        closeConfirmModal();
      },
    });
  };

  const handleUnpublishPress = () => {
    openConfirmModal({
      title: "Dépublier la formation ?",
      message:
        "Le code d'invitation sera désactivé. Les apprenants déjà inscrits gardent leur accès.",
      confirmLabel: "Dépublier",
      cancelLabel: "Annuler",
      danger: true,
      onConfirm: async () => {
        await onUnpublish?.(formation.id);
        closeConfirmModal();
      },
    });
  };

  const handleArchivePress = () => {
    openConfirmModal({
      title: "Archiver la formation ?",
      message:
        "Le code d'invitation sera désactivé. Vous pourrez restaurer cette formation en brouillon à tout moment.",
      confirmLabel: "Archiver",
      cancelLabel: "Annuler",
      danger: true,
      onConfirm: async () => {
        await onArchive?.(formation.id);
        closeConfirmModal();
      },
    });
  };

  const handleUnarchivePress = () => {
    openConfirmModal({
      title: "Restaurer la formation ?",
      message:
        "La formation sera remise en brouillon. Vous devrez la republier pour réactiver le code d'invitation.",
      confirmLabel: "Restaurer",
      cancelLabel: "Annuler",
      danger: false,
      onConfirm: async () => {
        await onUnarchive?.(formation.id);
        closeConfirmModal();
      },
    });
  };

  // ✅ Prolonger = ouvre le modal de modification (on délègue à onPress)
  const handleExtendPress = () => {
    openConfirmModal({
      title: "Prolonger la formation ?",
      message:
        "Vous allez modifier la date de fin pour prolonger cette formation.",
      confirmLabel: "Modifier la date",
      cancelLabel: "Annuler",
      danger: false,
      onConfirm: async () => {
        onPress?.();
        closeConfirmModal();
      },
    });
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
        opacity={isArchived ? 0.7 : 1}
      >
        {/* Barre de couleur selon statut */}
        <Box height={4} style={{ backgroundColor: statusConfig.color }} />

        <Box padding="m">
          {/* ✅ BANNIÈRE EXPIRATION — visible si published + sessionStatus completed */}
          {isExpired && (
            <View
              style={{
                backgroundColor: "#FEF3C7",
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <AlertTriangle
                size={16}
                color="#F59E0B"
                style={{ marginTop: 1 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  variant="caption"
                  fontWeight="700"
                  style={{ color: "#92400E", marginBottom: 4 }}
                >
                  Date de fin dépassée
                </Text>
                <Text
                  variant="caption"
                  style={{ color: "#92400E", lineHeight: 18 }}
                >
                  Cette formation est toujours publiée. Souhaitez-vous la
                  prolonger ou l&apos;archiver ?
                </Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={handleExtendPress}
                    style={{
                      backgroundColor: "#2563EB",
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 6,
                    }}
                  >
                    <Text variant="caption" color="white" fontWeight="600">
                      Prolonger
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleArchivePress}
                    style={{
                      backgroundColor: "white",
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: "#D1D5DB",
                    }}
                  >
                    <Text
                      variant="caption"
                      style={{ color: "#6B7280" }}
                      fontWeight="600"
                    >
                      Archiver
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Ligne 1 : Titre + badges */}
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
                {TrainingSchedule(formation.startDate, formation.endDate)}
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

          {/* ── ACTIONS — formation active ── */}
          {showActions && !isArchived && (
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginTop="s"
              paddingTop="s"
              borderTopWidth={1}
              borderTopColor="secondaryBackground"
            >
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

                {(isDraft || isPublished) && (
                  <TouchableOpacity onPress={handleArchivePress}>
                    <Box flexDirection="row" alignItems="center" gap="xs">
                      <Archive size={14} color="#9CA3AF" />
                      <Text variant="caption" color="muted">
                        Archiver
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

          {/* ── ACTIONS — formation archivée ── */}
          {isArchived && (
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginTop="s"
              paddingTop="s"
              borderTopWidth={1}
              borderTopColor="secondaryBackground"
            >
              {/* ✅ Bouton Restaurer */}
              <TouchableOpacity onPress={handleUnarchivePress}>
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <ArchiveRestore size={14} color="#2563EB" />
                  <Text variant="caption" color="primary" fontWeight="600">
                    Restaurer
                  </Text>
                </Box>
              </TouchableOpacity>

              <TouchableOpacity onPress={onPress}>
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <Text variant="action">Voir détails</Text>
                  <ChevronRight size={16} color="#3B82F6" />
                </Box>
              </TouchableOpacity>
            </Box>
          )}
        </Box>
      </Box>
      <ConfirmModal
        visible={confirmModal.visible}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel={confirmModal.cancelLabel}
        danger={confirmModal.danger}
      />
      <Snack
        visible={snack.visible}
        onDismiss={dismissSnack}
        message={snack.message}
        type={snack.type}
      />
    </TouchableOpacity>
  );
}
