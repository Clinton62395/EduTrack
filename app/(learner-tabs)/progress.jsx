import { useAuth } from "@/components/constants/authContext";
import { Box, Text } from "@/components/ui/theme";
import { CheckCircle2, Circle, Trophy } from "lucide-react-native";
import { ScrollView, TouchableOpacity } from "react-native";
import { useLearnerProgress } from "../../components/features/learnerProfile/hooks/useLearnerProgress";

export default function LearnerProgressScreen() {
  const { user } = useAuth();
  const currentTrainingId = user?.enrolledTrainings?.[0] || ""; // On prend la formation active
  const {
    modules,
    completedModuleIds,
    progressPercentage,
    toggleModule,
    loading,
  } = useLearnerProgress(user?.uid, currentTrainingId);

  if (loading) return <Text>Calcul du progrès...</Text>;

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* HEADER AVEC BARRE DE PROGRÈS */}
      <Box
        padding="l"
        marginTop="l"
        backgroundColor="white"
        borderBottomLeftRadius="xl"
        borderBottomRightRadius="xl"
        shadowColor="black"
        shadowOpacity={0.05}
        shadowRadius={10}
      >
        <Text variant="title">Ma Progression</Text>

        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginTop="m"
          marginBottom="s"
        >
          <Text variant="body" fontWeight="bold">
            {progressPercentage}% complété
          </Text>
          <Text variant="caption" color="muted">
            {completedModuleIds.length} / {modules.length} Modules
          </Text>
        </Box>

        {/* Barre grise (fond) */}
        <Box
          height={10}
          backgroundColor="secondaryBackground"
          borderRadius="rounded"
          overflow="hidden"
        >
          {/* Barre bleue (progression) */}
          <Box
            height="100%"
            backgroundColor="primary"
            width={`${progressPercentage}%`}
          />
        </Box>
      </Box>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {progressPercentage === 100 && (
          <Box
            backgroundColor="successLight"
            padding="m"
            borderRadius="l"
            marginBottom="l"
            flexDirection="row"
            alignItems="center"
          >
            <Trophy color="#10B981" size={24} />
            <Text marginLeft="m" color="success" fontWeight="bold">
              Félicitations ! Formation terminée.
            </Text>
          </Box>
        )}

        {modules.map((module, index) => {
          const isDone = completedModuleIds.includes(module.id);
          return (
            <TouchableOpacity
              key={module.id}
              onPress={() => toggleModule(module.id)}
            >
              <Box
                backgroundColor="white"
                padding="m"
                borderRadius="l"
                marginBottom="s"
                flexDirection="row"
                alignItems="center"
                borderWidth={1}
                borderColor={isDone ? "primary" : "transparent"}
              >
                <Box marginRight="m">
                  {isDone ? (
                    <CheckCircle2 color="#2563EB" size={24} />
                  ) : (
                    <Circle color="#D1D5DB" size={24} />
                  )}
                </Box>
                <Box flex={1}>
                  <Text variant="caption" color="muted">
                    Module {index + 1}
                  </Text>
                  <Text
                    variant="body"
                    fontWeight="bold"
                    color={isDone ? "primary" : "text"}
                  >
                    {module.title}
                  </Text>
                </Box>
              </Box>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Box>
  );
}
