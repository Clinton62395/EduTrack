import { router } from "expo-router";
import { BookOpen } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Platform } from "react-native";

import { TrainingCards } from "@/components/features/trainerProfile/trainingCard";
import { Box, Text } from "@/components/ui/theme";

import { useAuth } from "@/components/constants/authContext";
import {
  TrainingsHeader,
  TrainingsStatsBar,
} from "@/components/features/trainerProfile/trainingHeader";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { MyLoader } from "@/components/ui/loader";
import { Snack } from "@/components/ui/snackbar";
import { useTrainings } from "@/hooks/useTraining";
import CreateTrainingModal from "../(modal)/createTrainingModal";

export default function TrainerDashboard() {
  const {
    loading,
    trainings,
    filteredTrainings,
    stats,
    filter,
    setFilter,
    createTraining,
    updateTraining,
    publishTraining,
    unpublishTraining,
    deleteTraining,
    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
  } = useTrainings();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const handleDeletePress = (formation) => {
    setSelectedFormation(formation);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFormation) return;
    setIsDeleting(true);
    try {
      await deleteTraining(selectedFormation.id);
      setShowDeleteModal(false);
      setSelectedFormation(null);
    } catch (error) {
      console.error("Erreur suppression:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedFormation(null);
  };

  if (loading) return <MyLoader message="Chargement des formations..." />;

  return (
    <Box flex={1}>
      <TrainingsHeader
        total={trainings.length}
        stats={stats}
        filter={filter}
        onFilterChange={setFilter}
        onAdd={() => setShowCreateModal(true)}
      />

      <FlatList
        data={filteredTrainings}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => {}}
        renderItem={({ item }) => (
          <TrainingCards
            formation={item}
            onPress={() => router.push(`/(trainer-stack)/trainings/${item.id}`)}
            onOptionsPress={() => handleDeletePress(item)}
            onPublish={publishTraining}
            onUnpublish={unpublishTraining}
          />
        )}
        ListEmptyComponent={
          <Box alignItems="center" marginTop="xl">
            <BookOpen size={48} color="#9CA3AF" />
            <Text color="muted" marginTop="m">
              Aucune formation
            </Text>
          </Box>
        }
        contentContainerStyle={{ padding: 16 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        getItemLayout={(_, index) => ({
          length: 120,
          offset: 120 * index,
          index,
        })}
      />

      <TrainingsStatsBar formations={trainings} user={user} />

      <CreateTrainingModal
        visible={showCreateModal}
        onCreate={createTraining}
        onClose={() => setShowCreateModal(false)}
      />

      <ConfirmModal
        visible={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Supprimer la formation ?"
        message={
          selectedFormation
            ? `Êtes-vous sûr de vouloir supprimer "${selectedFormation.title}" ?`
            : "Cette action est irréversible"
        }
        loading={isDeleting}
        requiredMasterCode={user?.masterCode}
      />

      <Snack
        visible={snackVisible}
        onDismiss={dismissSnack}
        message={snackMessage}
        type={snackType}
      />
    </Box>
  );
}
