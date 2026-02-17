import { useAuth } from "@/components/constants/authContext";
import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import { CheckCircle2, TrendingUp } from "lucide-react-native";
import { FlatList } from "react-native";
import { useLearnerTrainings } from "../../components/features/learnerProfile/hooks/useLearnerTrainings";
import { SmallStatCard } from "../../components/features/learnerProfile/smallStactCard";
import { TrainingProgressCard } from "../../components/features/learnerProfile/learnerProgressCard";

export default function LearnerProgressionScreen() {
  const { user } = useAuth();
  const { myTrainings, loading } = useLearnerTrainings(user?.uid);

  if (loading) return <MyLoader message="Analyse de votre progression..." />;

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* HEADER STATS */}
      <Box
        padding="l"
        marginTop="l"
        backgroundColor="white"
        borderBottomLeftRadius="xl"
        borderBottomRightRadius="xl"
        style={{ elevation: 4 }}
      >
        <Text variant="title">Ma Progression</Text>
        <Box flexDirection="row" marginTop="l" gap="m">
          <SmallStatCard
            icon={<TrendingUp size={16} color="#2563EB" />}
            label="Moyenne"
            value={`${user?.averageProgression || 0}%`}
          />
          <SmallStatCard
            icon={<CheckCircle2 size={16} color="#10B981" />}
            label="Modules"
            value={user?.modulesCompletedCount || 0}
          />
        </Box>
      </Box>

      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={myTrainings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrainingProgressCard training={item} userId={user?.uid} />
        )}
      />
    </Box>
  );
}
