import { router } from "expo-router";
import { BookOpen } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList } from "react-native";

import { TrainingCards } from "@/components/features/trainerProfile/trainingCard";
import { Box, Text } from "@/components/ui/theme";

import { TrainingsHeader } from "@/components/features/trainerProfile/trainingHeader";
import { TrainingsStatsBar } from "@/components/features/trainerProfile/trainingStacBar";
import { CreateFormationModal } from "@/components/modal/trainingModal";
import { useTrainings } from "@/hooks/useTraining";

export default function TrainerDahsboard() {
  const { trainings, loading, createTraining, deleteTraining } = useTrainings();

  const [filter, setFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredFormations = trainings.filter((f) =>
    filter === "all" ? true : f.status === filter,
  );

  const handleDelete = (formation) => {
    Alert.alert("Suppression", `Supprimer "${formation.title}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => deleteTraining(formation.id),
      },
    ]);
  };

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" />
        <Text marginTop="m">Chargement...</Text>
      </Box>
    );
  }

  return (
    <Box flex={1}>
      <TrainingsHeader
        total={trainings.length}
        filter={filter}
        onFilterChange={setFilter}
        onAdd={() => setShowCreateModal(true)}
      />

      {/* ===== LIST ===== */}
      <FlatList
        data={filteredFormations}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => {
          /* La logique onSnapshot s'en occupe déjà, mais on garde le cercle de chargement si besoin */
        }}
        renderItem={({ item }) => (
          <TrainingCards
            formation={item}
            onPress={() => router.push(`/(trainer-tabs)/trainings/${item.id}`)}
            onOptionsPress={() => handleDelete(item)}
          />
        )}
        // Liste vide
        ListEmptyComponent={
          <Box alignItems="center" marginTop="xl">
            <BookOpen size={48} color="#9CA3AF" />
            <Text color="muted" marginTop="m">
              Aucune formation
            </Text>
          </Box>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      />
      {/* ===== STATS BAR ===== */}
      <TrainingsStatsBar formations={trainings} />

      {/* ===== MODAL ===== */}
      <CreateFormationModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createTraining}
      />
    </Box>
  );
}
