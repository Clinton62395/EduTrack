// TrainingDetailScreen.tsx (version corrigée)
import { useAuth } from "@/components/constants/authContext";

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
  Plus,
  Share2,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import { Image, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CreateTrainingModal } from "../../(modal)/createTrainingModal";
import { TrainerAttendanceControl } from "../../../components/features/trainerProfile/trainerAttenceControl";

export default function TrainingDetailScreen() {
  const { user } = useAuth();

  const { updateTraining } = useTrainings();
  const { copyToClipboard, shareFormation, CopyModal } =
    useFormationActions(user);
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    moduleId: null,
  });

  const openConfirm = (id) => {
    setDeleteModal({ visible: true, moduleId: id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteModal.moduleId;
    // Ton action de suppression réelle
    await moduleActions.handleDelete(id);
    setDeleteModal({ visible: false, moduleId: null });
  };
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // On extrait tout du hook personnalisé
  const {
    formation,
    loading, // Le loading global (formation + modules initial)
    modules,
    moduleActions,
    modals,
    snack,
  } = useTrainingDetail(id?.toString());

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <MyLoader message="chargement de formations" />
      </Box>
    );
  }

  if (!formation) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>Formation introuvable</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* HEADER AVEC IMAGE */}
      <Box height={250} width="100%" backgroundColor="gray">
        {formation.coverImage ? (
          <Image
            source={{ uri: formation.coverImage }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            backgroundColor="secondaryBackground"
          >
            <BookOpen size={48} color="#6B7280" />
            <Text variant="caption" color="muted" marginTop="s">
              Aucune image
            </Text>
          </Box>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: insets.top + 10,
            left: 20,
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: 20,
            padding: 8,
          }}
        >
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
      </Box>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Box
          padding="l"
          marginTop="l"
          backgroundColor="white"
          borderTopLeftRadius="xl"
          borderTopRightRadius="xl"
        >
          {/* TITRE ET BADGE */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box flex={1}>
              <Text variant="title" marginBottom="s">
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
            >
              <Share2 color="#2563EB" size={24} />
            </TouchableOpacity>
          </Box>

          {/* SECTION ADMINISTRATIVE : INVITATION ET PRÉSENCE */}
          <Box gap="m" marginTop="l">
            {/* Le contrôle de présence (Dynamique) */}
            <TrainerAttendanceControl trainingId={formation.id} />

            {/* Le code d'invitation (Statique) */}
            <Box
              backgroundColor="white"
              padding="m"
              borderRadius="l"
              borderWidth={1}
              borderColor="border"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Text variant="caption" color="muted">
                  Code d&apos;invitation
                </Text>
                <Text variant="body" fontWeight="bold" color="primary">
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
          </Box>

          {/* STATS */}
          <Box flexDirection="row" gap="m" marginTop="l">
            <StatCard
              icon={<Users size={20} color="#6B7280" />}
              label="Élèves"
              value={`${formation.currentLearners}/${formation.maxLearners}`}
            />
            <StatCard
              icon={<BookOpen size={20} color="#6B7280" />}
              label="Modules"
              value={modules?.length || "0"}
            />
          </Box>

          {/* DESCRIPTION */}
          <Box marginTop="xl">
            <Text variant="body" fontWeight="bold" marginBottom="s">
              À propos
            </Text>
            <Text variant="body" color="muted" lineHeight={22}>
              {formation.description || "Aucune description."}
            </Text>
          </Box>

          {/* SECTION MODULES */}
          <Box
            marginTop="xl"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text variant="body" fontWeight="bold">
              Programme
            </Text>
            <TouchableOpacity onPress={() => moduleActions.handleOpenAdd()}>
              <Plus size={20} color="#2563EB" />
            </TouchableOpacity>
          </Box>

          {modules?.length > 0 ? (
            <Box marginTop="m" gap="s">
              {modules.map((module, index) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  index={index}
                  onEdit={() => moduleActions.handleOpenEdit(module)}
                  onDelete={() => openConfirm(module.id)}
                />
              ))}
            </Box>
          ) : (
            <EmptyModuleState onAdd={() => moduleActions.handleOpenAdd()} />
          )}
        </Box>
      </ScrollView>

      {/* BARRE D'ACTION FIXE */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="white"
        padding="m"
        borderTopWidth={1}
        borderTopColor="border"
        flexDirection="row"
        gap="m"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <Box flex={1}>
          <Button
            title="Gérer les élèves"
            variant="outline"
            iconPosition="right"
            icon={<Users size={20} color="#6B7280" />}
          />
        </Box>

        {/* updates button  */}
        <Box flex={1}>
          <Button
            title="Modifier"
            icon={<Edit size={20} color="#2563EB" />}
            iconPosition="right"
            variant={formation.status === "planned" ? "primary" : "secondary"}
            onPress={() => {
              if (formation.status !== "planned") {
                snack.show(
                  "Impossible de modifier une formation en cours ou terminée.",
                  "error",
                );
                return;
              }
              modals.update.open(); // ouvre le modal si c'est ok
            }}
          />
        </Box>
      </Box>

      {/* delete modal  */}
      <ConfirmModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false, moduleId: null })}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce module ?"
        message="Cette action effacera définitivement le module et tout son contenu."
        loading={moduleActions.isSubmitting} // Si ton hook gère un état loading
        requiredMasterCode={user.masterCode}
        onError={(message) => {
          snack.show(message, "error");
        }}
      />

      {/* MODALS PILOTÉS PAR LE HOOK */}
      <AddModuleModal
        visible={modals.module.visible}
        onClose={modals.module.close}
        onSubmit={moduleActions.handleSubmit}
        loading={moduleActions.isSubmitting}
        module={modals.module.selected}
      />

      {/* MODALS PILOTÉS PAR LE HOOK */}
      <CreateTrainingModal
        visible={modals.update.visible}
        onClose={modals.update.close}
        initialData={formation}
        onUpdate={async (id, data) => {
          // On force l'attente de la mise à jour
          const success = await updateTraining(id, data);
          if (success) {
            modals.update.close();
            snack.show("Formation mise à jour !", "success");
          }
        }}
      />

      {/* copier le code d'invitation et partager la formation modal */}
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

// Composant interne pour les stats
function StatCard({ icon, label, value }) {
  return (
    <Box
      flex={1}
      padding="m"
      backgroundColor="secondaryBackground"
      borderRadius="m"
      alignItems="center"
    >
      {icon}
      <Text variant="caption" color="muted" marginTop="xs">
        {label}
      </Text>
      <Text variant="body" fontWeight="bold">
        {value}
      </Text>
    </Box>
  );
}
