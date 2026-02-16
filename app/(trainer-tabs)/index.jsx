import { router } from "expo-router";
import { BookOpen } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Platform } from "react-native";

import { TrainingCards } from "@/components/features/trainerProfile/trainingCard";
import { Box, Text } from "@/components/ui/theme";

import { TrainingsHeader } from "@/components/features/trainerProfile/trainingHeader";
import { TrainingsStatsBar } from "@/components/features/trainerProfile/trainingStacBar";
import { MyLoader } from "@/components/ui/loader";
import { Snack } from "@/components/ui/snackbar";
import { useTrainings } from "@/hooks/useTraining";
import { CreateTrainingModal } from "../(modal)/createTrainingModal";
import { useAuth } from "../../components/constants/authContext";
import { ConfirmModal } from "../../components/modal/ConfirmModal";

export default function TrainerDashboard() {
  const {
    trainings,
    loading,
    createTraining,
    deleteTraining,
    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
  } = useTrainings();

  const [filter, setFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null); // ✅ Stocke la formation à supprimer
  const [isDeleting, setIsDeleting] = useState(false); // ✅ État de chargement
  const { user } = useAuth();

  const filteredFormations = trainings.filter((f) =>
    filter === "all" ? true : f.status === filter,
  );

  // ✅ Ouvre le modal et stocke la formation
  const handleDeletePress = (formation) => {
    setSelectedFormation(formation);
    setShowDeleteModal(true);
  };

  // ✅ Confirmation de suppression (appelée par le modal)
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

  // ✅ Annulation (ferme le modal sans supprimer)
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedFormation(null);
  };

  if (loading) return <MyLoader message="Chargement des formations..." />;

  return (
    <Box flex={1}>
      <TrainingsHeader
        total={trainings.length}
        filter={filter}
        onFilterChange={setFilter}
        onAdd={() => setShowCreateModal(true)}
      />

      <FlatList
        data={filteredFormations}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => {}}
        renderItem={({ item }) => (
          <TrainingCards
            formation={item}
            onPress={() => router.push(`/(trainer-tabs)/trainings/${item.id}`)}
            onOptionsPress={() => handleDeletePress(item)}
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
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        getItemLayout={(data, index) => ({
          length: 120,
          offset: 120 * index,
          index,
        })}
      />

      <TrainingsStatsBar formations={trainings} />

      {/* Modal de création */}
      <CreateTrainingModal
        visible={showCreateModal}
        onCreate={createTraining}
        onClose={() => setShowCreateModal(false)}
      />

      {/* ✅ Modal de confirmation corrigé */}
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
        requiredMasterCode={user?.masterCode} // ✅ Si vous avez un code master
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
