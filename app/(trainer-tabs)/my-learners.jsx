import { useAuth } from "@/components/constants/authContext";
import { useLearnersData } from "@/components/features/trainerProfile/hooks/useLearnerData";
import { Box, Text } from "@/components/ui/theme";
import { useLocalSearchParams } from "expo-router";
import { ChevronDown, GraduationCap } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MyLoader } from "../../components/ui/loader";
import { useTrainings } from "../../hooks/useTraining";

// ─────────────────────────────────────────
// 🧩 LIGNE ÉLÈVE
// ─────────────────────────────────────────
import { Image } from "react-native";

export default function MyLearnersScreen() {
  const { user } = useAuth();

  // ✅ Si on arrive depuis le bouton "Gérer les élèves",
  // trainingId est déjà présélectionné via params
  const { trainingId: paramTrainingId } = useLocalSearchParams();

  // Liste de toutes les formations du trainer pour le sélecteur
  const { trainings } = useTrainings(user?.uid);

  const [selectedTrainingId, setSelectedTrainingId] = useState(
    paramTrainingId || null,
  );
  const [showSelector, setShowSelector] = useState(false);

  // Mise à jour si on arrive avec un param (depuis le bouton raccourci)
  useEffect(() => {
    if (paramTrainingId) {
      setSelectedTrainingId(paramTrainingId);
    }
  }, [paramTrainingId]);

  const { learners, loading } = useLearnersData(selectedTrainingId);

  // Nom de la formation sélectionnée
  const selectedTraining = trainings?.find((t) => t.id === selectedTrainingId);

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* ─── HEADER ─── */}
      <Box
        padding="l"
        marginTop="l"
        backgroundColor="white"
        borderBottomWidth={1}
        borderBottomColor="secondaryBackground"
      >
        <Text variant="title">Mes Élèves</Text>
        <Text variant="caption" color="muted">
          Suivez la progression de vos apprenants
        </Text>
      </Box>

      {/* ─── SÉLECTEUR DE FORMATION ─── */}
      <Box padding="m">
        <TouchableOpacity
          onPress={() => setShowSelector((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Box
            backgroundColor="white"
            borderRadius="l"
            padding="m"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            style={styles.card}
          >
            <Box flex={1}>
              <Text variant="caption" color="muted">
                Formation sélectionnée
              </Text>
              <Text variant="body" fontWeight="bold" numberOfLines={1}>
                {selectedTraining?.title || "Choisir une formation..."}
              </Text>
            </Box>
            <ChevronDown
              size={20}
              color="#6B7280"
              style={{
                transform: [{ rotate: showSelector ? "180deg" : "0deg" }],
              }}
            />
          </Box>
        </TouchableOpacity>

        {/* ── Dropdown formations ── */}
        {showSelector && (
          <Box
            backgroundColor="white"
            borderRadius="l"
            marginTop="xs"
            style={styles.dropdown}
          >
            <ScrollView style={{ maxHeight: 200 }}>
              {trainings?.map((training) => {
                const isSelected = training.id === selectedTrainingId;
                return (
                  <TouchableOpacity
                    key={training.id}
                    onPress={() => {
                      setSelectedTrainingId(training.id);
                      setShowSelector(false);
                    }}
                  >
                    <Box
                      padding="m"
                      backgroundColor={isSelected ? "secondaryDark" : "white"}
                      borderBottomWidth={1}
                      borderBottomColor="secondaryBackground"
                    >
                      <Text
                        variant="body"
                        color={isSelected ? "primary" : "text"}
                        fontWeight={isSelected ? "bold" : "normal"}
                      >
                        {training.title}
                      </Text>
                      <Text variant="caption" color="muted">
                        {training.currentLearners || 0} élève
                        {training.currentLearners > 1 ? "s" : ""}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Box>
        )}
      </Box>

      {/* ─── CONTENU ─── */}
      {!selectedTrainingId ? (
        // ── Aucune formation sélectionnée ──
        <Box flex={1} justifyContent="center" alignItems="center" padding="xl">
          <GraduationCap size={48} color="#D1D5DB" />
          <Text color="muted" textAlign="center" marginTop="m">
            Sélectionnez une formation pour voir les élèves inscrits.
          </Text>
        </Box>
      ) : loading ? (
        <MyLoader message="Chargement des élèves..." />
      ) : (
        <FlatList
          data={learners}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListHeaderComponent={() => (
            <Text variant="caption" color="muted" marginBottom="m">
              {learners.length} élève{learners.length > 1 ? "s" : ""} inscrit
              {learners.length > 1 ? "s" : ""}
            </Text>
          )}
          renderItem={({ item }) => <LearnerRow learner={item} />}
          ListEmptyComponent={() => (
            <Box
              padding="xl"
              alignItems="center"
              backgroundColor="white"
              borderRadius="xl"
              style={styles.card}
            >
              <GraduationCap size={48} color="#D1D5DB" />
              <Text color="muted" marginTop="m" textAlign="center">
                Aucun élève n&apos;a encore rejoint cette formation.
              </Text>
            </Box>
          )}
        />
      )}
    </Box>
  );
}

function LearnerRow({ learner }) {
  return (
    <Box
      backgroundColor="white"
      padding="m"
      borderRadius="l"
      marginBottom="s"
      style={styles.card}
    >
      <Box flexDirection="row" alignItems="center">
        {/* Avatar ou initiale */}
        <Box
          width={45}
          height={45}
          borderRadius="rounded"
          backgroundColor="secondaryBackground"
          justifyContent="center"
          alignItems="center"
          overflow="hidden"
        >
          {learner.avatar ? (
            <Image
              source={{ uri: learner.avatar }}
              style={{ width: 45, height: 45, borderRadius: 22.5 }}
              resizeMode="cover"
            />
          ) : (
            <Text fontWeight="bold" color="primary" style={{ fontSize: 18 }}>
              {learner.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          )}
        </Box>

        {/* Nom + email */}
        <Box flex={1} marginLeft="m">
          <Text variant="body" fontWeight="bold">
            {learner.name || "Apprenant"}
          </Text>
          <Text variant="caption" color="muted">
            {learner.email}
          </Text>
        </Box>

        {/* Leçons complétées */}
        <Box alignItems="flex-end">
          <Text variant="body" fontWeight="bold" color="primary">
            {learner.completedLessons}
          </Text>
          <Text variant="caption" color="muted">
            leçon{learner.completedLessons > 1 ? "s" : ""} faite
            {learner.completedLessons > 1 ? "s" : ""}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  dropdown: {
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 999,
  },
});
