import { Box, Text } from "@/components/ui/theme";
import { GraduationCap, Percent } from "lucide-react-native";
import { FlatList, Image } from "react-native";
import { useLearnersData } from "./hooks/useLearnerData";

export default function LearnersListTab({ trainingId }) {
  const { learners, loading } = useLearnersData(trainingId);

  if (loading) return <Text>Chargement des élèves...</Text>;

  return (
    <Box flex={1} backgroundColor="secondaryBackground" padding="m">
      <FlatList
        data={learners}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <Box marginBottom="m">
            <Text variant="body" fontWeight="bold">
              Élèves inscrits ({learners.length})
            </Text>
          </Box>
        )}
        renderItem={({ item }) => <LearnerRow learner={item} />}
        ListEmptyComponent={() => (
          <Box padding="xl" alignItems="center">
            <GraduationCap size={48} color="#D1D5DB" />
            <Text color="muted" marginTop="m">
              Aucun élève n'a encore rejoint.
            </Text>
          </Box>
        )}
      />
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
      flexDirection="row"
      alignItems="center"
    >
      {/* Avatar */}
      <Box
        width={50}
        height={50}
        borderRadius="full"
        backgroundColor="secondaryBackground"
        overflow="hidden"
      >
        {learner.avatar ? (
          <Image
            source={{ uri: learner.avatar }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Box flex={1} justifyContent="center" alignItems="center">
            <Text fontWeight="bold" color="primary">
              {learner.name?.charAt(0) || "U"}
            </Text>
          </Box>
        )}
      </Box>

      {/* Infos */}
      <Box flex={1} marginLeft="m">
        <Text variant="body" fontWeight="bold">
          {learner.name || "Apprenant"}
        </Text>
        <Box flexDirection="row" marginTop="xs">
          <Box flexDirection="row" alignItems="center" marginRight="m">
            <Percent size={12} color="#6B7280" />
            <Text variant="caption" color="muted" marginLeft="xs">
              {learner.attendanceRate || 0}% Présence
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Progression visuelle rapide */}
      <Box alignItems="flex-end">
        <Text variant="caption" color="primary" fontWeight="bold">
          Progression
        </Text>
        <Text variant="body">{learner.overallProgress || 0}%</Text>
      </Box>
    </Box>
  );
}
