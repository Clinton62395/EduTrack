import { MyLoader } from "@/components/ui/loader";
import ModuleCard from "@/components/ui/modulCard"; // On réutilise ton composant !
import { Box, Text } from "@/components/ui/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookOpen, ChevronLeft, Clock, PlayCircle } from "lucide-react-native";
import { Image, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../components/constants/authContext";
import { useLearnerTrainingDetail } from "../../../components/features/learnerProfile/hooks/useTrainingDetailsFromLearner";
import { calculateDuration } from "../../../components/helpers/TrainingTimeCalculation";

export default function LearnerTrainingDetail() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formation, modules, completedLessonIds, loading } =
    useLearnerTrainingDetail(id, user?.uid);

  if (loading) return <MyLoader message="Chargement du cours..." />;
  if (!formation)
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>Formation introuvable</Text>
      </Box>
    );

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* HEADER IMAGE (Identique au Trainer) */}
      <Box height={250} width="100%" backgroundColor="gray">
        {formation.coverImage ? (
          <Image
            source={{ uri: formation.coverImage }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            backgroundColor="secondaryBackground"
          >
            <BookOpen size={48} color="#6B7280" />
          </Box>
        )}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: insets.top + 10,
            left: 20,
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: 20,
            padding: 8,
          }}
        >
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>

        {/* text overlay  on image when no module */}
        {modules.length === 0 && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="overlayDark"
            justifyContent="center"
            flexDirection="column"
            alignItems="center"
            padding="m"
          >
            <Text color="textSecondary" fontWeight="bold">
              Aucun module attaché à ce cours
            </Text>
            <Text color="textSecondary" fontWeight="bold">
              votre professeur ajoutera du module bientot !
            </Text>
          </Box>
        )}
      </Box>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Box
          padding="l"
          marginTop="l"
          backgroundColor="white"
          borderTopLeftRadius="xl"
          borderTopRightRadius="xl"
        >
          {/* TITRE ET CATEGORIE */}
          <Text variant="title" marginBottom="s">
            {formation.title}
          </Text>
          <Box
            backgroundColor="secondaryBackground"
            paddingHorizontal="s"
            paddingVertical="xs"
            borderRadius="s"
            alignSelf="flex-start"
          >
            <Text variant="caption" color="primary">
              {formation.category}
            </Text>
          </Box>

          {/* STATS (On réutilise StatCard) */}
          <Box flexDirection="row" gap="m" marginTop="l">
            <StatCard
              icon={<Clock size={20} color="#6B7280" />}
              label="Durée"
              value={calculateDuration(formation.startDate, formation.endDate)}
            />
            <StatCard
              icon={<BookOpen size={20} color="#6B7280" />}
              label="Modules"
              value={modules.length.toString()}
            />
          </Box>

          {/* DESCRIPTION */}
          <Box marginTop="xl">
            <Text variant="body" fontWeight="bold" marginBottom="s">
              À propos du cours
            </Text>
            <Text variant="body" color="muted" lineHeight={22}>
              {formation.description}
            </Text>
          </Box>

          {/* PROGRAMME (Modules en lecture seule) */}
          <Box marginTop="xl" marginBottom="m">
            <Text variant="body" fontWeight="bold">
              Programme de formation
            </Text>
          </Box>

          {modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={index}
              onPress={() =>
                router.push({
                  pathname: "/(learner-tabs)/my-trainings/moduleContent",
                  params: {
                    moduleId: module.id,
                    trainingId: id,
                    moduleTitle: module.title,
                  },
                })
              }
              isLearner={true} // 💡 On peut passer cette prop pour cacher les boutons d'édition dans ModuleCard
            />
          ))}
        </Box>
      </ScrollView>

      {/* BOUTON D'ACTION FIXE */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="white"
        padding="m"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <TouchableOpacity
          disabled={modules.length === 0}
          style={{
            backgroundColor: modules.length === 0 ? "#E5E7EB" : "#2563EB",
            padding: 16,
            borderRadius: 12,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            const nextModule = modules[0];
            if (nextModule) {
              router.push({
                pathname: "/(learner-tabs)/my-trainings/moduleContent",
                params: {
                  moduleId: nextModule.id,
                  trainingId: id,
                  moduleTitle: nextModule.title,
                },
              });
            }
          }}
        >
          <PlayCircle size={20} color="white" style={{ marginRight: 8 }} />
          <Text color="white" fontWeight="bold">
            Continuer l&apos;apprentissage
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Box
      flex={1}
      padding="m"
      backgroundColor="secondaryBackground"
      borderRadius="m"
      alignItems="center"
    >
      {icon}
      <Text variant="caption" color="muted" marginTop="xs">
        {label}
      </Text>
      <Text variant="body" fontWeight="bold">
        {value}
      </Text>
    </Box>
  );
}
