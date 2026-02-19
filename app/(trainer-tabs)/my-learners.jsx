import { Box, Text } from "@/components/ui/theme";
import { GraduationCap } from "lucide-react-native";
import { FlatList } from "react-native";
import { useLearnersData } from "../../components/features/trainerProfile/hooks/useLearnerData";
import { MyLoader } from "../../components/ui/loader";

export default function MyLearnersScreen({ trainingId }) {
  const { learners, loading } = useLearnersData(trainingId);

  if (loading) return <MyLoader message="chargment des eleves ..." />;

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
      shadowColor="black"
      shadowOpacity={0.05}
      shadowRadius={5}
    >
      <Box flexDirection="row" alignItems="center">
        {/* Avatar */}
        <Box
          width={45}
          height={45}
          borderRadius="full"
          backgroundColor="secondaryBackground"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontWeight="bold" color="primary">
            {learner.name?.charAt(0) || "U"}
          </Text>
        </Box>

        {/* Infos Nom */}
        <Box flex={1} marginLeft="m">
          <Text variant="body" fontWeight="bold">
            {learner.name || "Apprenant"}
          </Text>
          <Text variant="caption" color="muted">
            {learner.email}
          </Text>
        </Box>

        {/* Pourcentage à droite */}
        <Box alignItems="flex-end">
          <Text variant="body" fontWeight="bold" color="primary">
            {learner.progress}%
          </Text>
          <Text variant="caption" color="muted">
            avancement
          </Text>
        </Box>
      </Box>

      {/* Barre de progression miniature */}
      <Box
        height={4}
        backgroundColor="secondaryBackground"
        borderRadius="full"
        marginTop="m"
        overflow="hidden"
      >
        <Box
          height="100%"
          backgroundColor={learner.progress === 100 ? "success" : "primary"}
          width={`${learner.progress}%`}
        />
      </Box>
    </Box>
  );
}
