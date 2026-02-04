import { router } from "expo-router";
import { BookOpen } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList } from "react-native";

import { FormationCard } from "@/components/features/trainerProfile/trainingCard";
import { Box, Text } from "@/components/ui/theme";

import { TrainingsHeader } from "../../components/features/trainerProfile/trainingHeader";
import { TrainingsStatsBar } from "../../components/features/trainerProfile/trainingStacBar";
import { useTrainings } from "../../components/features/trainerProfile/useTraining";
import { CreateFormationModal } from "../../components/modal/trainingModal";

export default function TrainingsScreen() {
  const { formations, loading, createFormation, deleteFormation } =
    useTrainings();

  const [filter, setFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredFormations = formations.filter((f) =>
    filter === "all" ? true : f.status === filter,
  );

  const handleDelete = (formation) => {
    Alert.alert("Suppression", `Supprimer "${formation.title}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => deleteFormation(formation.id),
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
        total={formations.length}
        filter={filter}
        onFilterChange={setFilter}
        onAdd={() => setShowCreateModal(true)}
      />

      <FlatList
        data={filteredFormations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FormationCard
            formation={item}
            onPress={() =>
              router.push(`/(tabs)/(trainer)/trainings/${item.id}`)
            }
            onOptionsPress={() => handleDelete(item)}
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
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      />

      <TrainingsStatsBar formations={formations} />

      <CreateFormationModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createFormation}
      />
    </Box>
  );
}
