import { useAuth } from "@/components/constants/authContext";
import { ResourcesSection } from "@/components/features/trainerProfile/ressourcesSection";
import { useFormationActions } from "@/components/helpers/actionButton";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import AddModuleModal from "@/components/modal/moduleModal";
import { EmptyModuleState } from "@/components/ui/EmptyModuleState";
import { MyLoader } from "@/components/ui/loader";
import ModuleCard from "@/components/ui/modulCard";
import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { useTrainings } from "@/hooks/useTraining";
import { useTrainingDetail } from "@/hooks/useTrainingDetails";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  BookOpen,
  ChevronLeft,
  Edit,
  Eye,
  MessageCircle,
  Plus,
  Share2,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CreateTrainingModal from "../../(modal)/createTrainingModal";
import { ms } from "../../../components/ui/theme";

// ─────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────
const STATUS_CONFIG = {
  draft: { label: "Brouillon", color: "#6B7280", bg: "#F3F4F6" },
  published: { label: "Publiée", color: "#10B981", bg: "#ECFDF5" },
  archived: { label: "Archivée", color: "#9CA3AF", bg: "#F9FAFB" },
};

export default function TrainingDetailScreen() {
  const { user } = useAuth();
  const { updateTraining } = useTrainings();
  const { copyToClipboard, shareFormation, CopyModal } =
    useFormationActions(user);

  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    moduleId: null,
  });
  const { trainingDetailsId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { formation, loading, modules, moduleActions, modals, snack } =
    useTrainingDetail(trainingDetailsId?.toString());

  const openConfirm = (id) => setDeleteModal({ visible: true, moduleId: id });

  const handleConfirmDelete = async () => {
    await moduleActions.handleDelete(deleteModal.moduleId);
    setDeleteModal({ visible: false, moduleId: null });
  };

  if (loading) {
    return <MyLoader message="Chargement de la formation..." />;
  }

  if (!formation) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>Formation introuvable</Text>
      </Box>
    );
  }

  const statusConfig = STATUS_CONFIG[formation.status] || STATUS_CONFIG.draft;
  const isPublished = formation.status === "published";
  const isDraft = formation.status === "draft";

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* ── COVER IMAGE ── */}
      <Box height={ms(260)} width="100%" backgroundColor="secondaryBackground">
        {formation.coverImage ? (
          <Image
            source={{ uri: formation.coverImage }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Box flex={1} justifyContent="center" alignItems="center">
            <BookOpen size={48} color="#D1D5DB" />
            <Text variant="caption" color="muted" marginTop="s">
              Aucune image de couverture
            </Text>
          </Box>
        )}

        {/* Overlay gradient en bas de l'image */}
        <View style={styles.imageOverlay} />

        {/* Retour */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.floatingBtn,
            { top: insets.top + ms(10), left: ms(20) },
          ]}
        >
          <ChevronLeft color="white" size={22} />
        </TouchableOpacity>

        {/* Chat */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(trainer-stack)/trainings/chat",
              params: {
                trainingId: formation.id,
                trainingTitle: formation.title,
              },
            })
          }
          style={[
            styles.floatingBtn,
            { top: insets.top + ms(10), right: ms(20) },
          ]}
        >
          <MessageCircle color="white" size={22} />
        </TouchableOpacity>

        {/* Badge statut sur l'image */}
        <View
          style={[
            styles.statusBadge,
            { bottom: ms(16), left: ms(20), backgroundColor: statusConfig.bg },
          ]}
        >
          <View
            style={[styles.statusDot, { backgroundColor: statusConfig.color }]}
          />
          <Text
            variant="caption"
            fontWeight="700"
            style={{ color: statusConfig.color }}
          >
            {statusConfig.label}
          </Text>
        </View>
      </Box>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Box
          backgroundColor="white"
          borderTopLeftRadius="xl"
          borderTopRightRadius="xl"
          marginTop="xl"
          padding="l"
        >
          {/* ── TITRE + PARTAGE ── */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
            marginBottom="s"
          >
            <Box flex={1} marginRight="m">
              <Text variant="title" marginBottom="xs">
                {formation.title}
              </Text>
              <Box
                backgroundColor="secondaryBackground"
                paddingHorizontal="s"
                paddingVertical="xs"
                borderRadius="s"
                alignSelf="flex-start"
              >
                <Text variant="caption" color="primary">
                  {formation.category}
                </Text>
              </Box>
            </Box>
            <TouchableOpacity
              onPress={() =>
                shareFormation(formation.title, formation.invitationCode)
              }
              hitSlop={10}
            >
              <Share2 color="#2563EB" size={22} />
            </TouchableOpacity>
          </Box>

          {/* ── STATS ── */}
          <Box flexDirection="row" gap="m" marginTop="l" marginBottom="l">
            <StatCard
              icon={<Users size={18} color="#2563EB" />}
              label="Élèves"
              value={`${formation.currentLearners || 0}/${formation.maxLearners}`}
              accent="#EFF6FF"
            />
            <StatCard
              icon={<BookOpen size={18} color="#7C3AED" />}
              label="Modules"
              value={modules?.length || 0}
              accent="#F5F3FF"
            />
          </Box>

          {/* ── CODE D'INVITATION (uniquement si published) ── */}
          {isPublished && (
            <Box
              backgroundColor="secondaryBackground"
              padding="m"
              borderRadius="l"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginBottom="l"
            >
              <Box>
                <Text variant="caption" color="muted">
                  Code d&apos;invitation actif
                </Text>
                <Text
                  variant="body"
                  fontWeight="bold"
                  color="primary"
                  fontSize={18}
                >
                  {formation.invitationCode}
                </Text>
              </Box>
              <Button
                title="Copier"
                variant="outline"
                size="small"
                onPress={() => copyToClipboard(formation.invitationCode)}
              />
            </Box>
          )}

          {/* Draft → message incitatif */}
          {isDraft && (
            <Box
              backgroundColor="warningBackground"
              padding="m"
              borderRadius="l"
              marginBottom="l"
              flexDirection="row"
              alignItems="center"
              gap="s"
            >
              <Eye size={16} color="#F59E0B" />
              <Text variant="caption" style={{ color: "#92400E" }} flex={1}>
                Cette formation est en brouillon. Publiez-la depuis le tableau
                de bord pour activer le code d&apos;invitation.
              </Text>
            </Box>
          )}

          {/* ── DESCRIPTION ── */}
          <Box marginBottom="xl">
            <Text variant="body" fontWeight="bold" marginBottom="s">
              À propos
            </Text>
            <Text variant="body" color="muted" lineHeight={22}>
              {formation.description || "Aucune description."}
            </Text>
          </Box>

          {/* ── RESSOURCES ── */}
          <ResourcesSection
            formationId={formation.id}
            resources={formation.resources || []}
          />

          {/* ── MODULES ── */}
          <Box
            marginTop="xl"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="m"
          >
            <Text variant="body" fontWeight="bold">
              Programme ({modules?.length || 0} modules)
            </Text>
            <TouchableOpacity
              onPress={() => moduleActions.handleOpenAdd()}
              style={styles.addBtn}
            >
              <Plus size={18} color="white" />
            </TouchableOpacity>
          </Box>

          {modules?.length > 0 ? (
            <Box gap="s">
              {modules.map((module, index) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  index={index}
                  onEdit={() => moduleActions.handleOpenEdit(module)}
                  onDelete={() => openConfirm(module.id)}
                  onPress={() =>
                    router.push({
                      pathname: `/(trainer-stack)/trainings/module/${module.id}`,
                      params: {
                        moduleId: module.id,
                        formationId: formation.id,
                        moduleTitle: module.title,
                      },
                    })
                  }
                />
              ))}
            </Box>
          ) : (
            <EmptyModuleState onAdd={() => moduleActions.handleOpenAdd()} />
          )}
        </Box>
      </ScrollView>

      {/* ── BARRE D'ACTION FIXE ── */}
      <Box
        position="absolute"
        justifyContent="space-between"
        alignItems="center"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="white"
        padding="m"
        borderTopWidth={1}
        borderTopColor="border"
        flexDirection="row"
        gap="m"
        style={{ paddingBottom: insets.bottom + ms(10), elevation: ms(8) }}
      >
        <Box flex={1}>
          <Button
            title="Élèves"
            variant="outline"
            icon={<Users size={18} color="#6B7280" />}
            iconPosition="left"
            onPress={() =>
              router.push({
                pathname: "/(trainer-tabs)/my-learners",
                params: { trainingId: formation.id },
              })
            }
          />
        </Box>

        <Box>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(trainer-stack)/trainings/chat",
                params: {
                  trainingId: formation.id,
                  trainingTitle: formation.title,
                },
              })
            }
            style={styles.chatButton}
          >
            <Image
              source={require("@/assets/images/chat-bubble.gif")}
              style={{
                width: ms(60),
                height: ms(60),
              }}
              contentFit="cover"
            />
          </TouchableOpacity>
        </Box>

        <Box flex={1}>
          <Button
            title="Modifier"
            icon={<Edit size={18} color="white" />}
            iconPosition="left"
            variant="primary"
            onPress={() => {
              // ✅ Aligné sur le nouveau système de statut
              if (formation.status === "archived") {
                snack.show(
                  "Formation archivée, modification impossible.",
                  "error",
                );
                return;
              }
              modals.update.open();
            }}
          />
        </Box>
      </Box>

      {/* ── MODALS ── */}
      <ConfirmModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false, moduleId: null })}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce module ?"
        message="Cette action effacera définitivement le module et tout son contenu."
        loading={moduleActions.isSubmitting}
        requiredMasterCode={user.masterCode}
        onError={(message) => snack.show(message, "error")}
      />

      <AddModuleModal
        visible={modals.module.visible}
        onClose={modals.module.close}
        onSubmit={moduleActions.handleSubmit}
        loading={moduleActions.isSubmitting}
        module={modals.module.selected}
      />

      <CreateTrainingModal
        visible={modals.update.visible}
        onClose={modals.update.close}
        initialData={formation}
        onUpdate={async (id, data) => {
          const success = await updateTraining(id, data);
          if (success) {
            modals.update.close();
            snack.show("Formation mise à jour !", "success");
          }
        }}
      />

      <CopyModal />

      <Snack
        visible={snack.visible}
        onDismiss={snack.dismiss}
        message={snack.message}
        type={snack.type}
      />
    </Box>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <Box
      flex={1}
      padding="m"
      borderRadius="l"
      alignItems="center"
      style={{ backgroundColor: accent || "secondaryDark" }}
    >
      {icon}
      <Text variant="caption" color="muted" marginTop="xs">
        {label}
      </Text>
      <Text variant="body" fontWeight="bold" fontSize={18}>
        {value}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  floatingBtn: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: ms(20),
    padding: ms(8),
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: ms(60),
    background: "linear-gradient(transparent, rgba(0,0,0,0.3))",
  },
  statusBadge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(20),
  },
  statusDot: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(4),
  },
  addBtn: {
    backgroundColor: "#2563EB",
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    justifyContent: "center",
    alignItems: "center",
  },
  chatButton: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(12),
    borderWidth: ms(2),
    borderColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
});
