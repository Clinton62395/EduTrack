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
import { LearnerRow } from "../../components/features/trainerProfile/learnersAction/learnerRow";
import { QuizResetModal } from "../../components/features/trainerProfile/learnersAction/quizResetModal";
import { MyLoader } from "../../components/ui/loader";
import { useTrainings } from "../../hooks/useTraining";

export default function MyLearnersScreen() {
  const { user } = useAuth();
  const { trainingId: paramTrainingId } = useLocalSearchParams();
  const { trainings } = useTrainings(user?.uid);

  const [selectedTrainingId, setSelectedTrainingId] = useState(
    paramTrainingId || null,
  );
  const [showSelector, setShowSelector] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState(null);

  useEffect(() => {
    if (paramTrainingId) setSelectedTrainingId(paramTrainingId);
  }, [paramTrainingId]);

  const { learners, loading, MAX_ATTEMPTS } =
    useLearnersData(selectedTrainingId);
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

      {/* ─── SÉLECTEUR ─── */}
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
                      borderBottomWidth={1}
                      borderBottomColor="secondaryBackground"
                      backgroundColor={
                        isSelected ? "secondaryBackground" : "white"
                      }
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
          renderItem={({ item }) => (
            <LearnerRow
              learner={item}
              onManageQuiz={() => setSelectedLearner(item)}
              MAX_ATTEMPTS={MAX_ATTEMPTS}
            />
          )}
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

      {/* ─── MODAL QUIZ RESET ─── */}
      {selectedLearner && (
        <QuizResetModal
          learner={selectedLearner}
          onClose={() => setSelectedLearner(null)}
          MAX_ATTEMPTS={MAX_ATTEMPTS}
        />
      )}
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
  alertBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  quizButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  quizButtonAlert: { borderTopColor: "#FEE2E2" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  quizRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  resetButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
});
