import { useAuth } from "@/components/constants/authContext";
import { MyLoader } from "@/components/ui/loader";
import { Box, Button, Text } from "@/components/ui/theme";
import { router } from "expo-router";
import { ArrowRight, BookOpen, Download, FileText } from "lucide-react-native";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { JoinTrainingModal } from "../(modal)/learnerModal/joinTrainingModal";
import { useLearnerTrainings } from "../../components/features/learnerProfile/hooks/useLearnerTrainings";

export default function LearnerResourcesScreen() {
  const { user } = useAuth();
  const { myTrainings, loading } = useLearnerTrainings(user?.uid);

  if (loading) return <MyLoader message="Chargement des ressources..." />;

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* HEADER */}
      <Box
        padding="l"
        marginTop="l"
        backgroundColor="white"
        borderBottomWidth={1}
        borderBottomColor="secondaryBackground"
      >
        <Text variant="title">Mes Ressources</Text>
        <Text variant="caption" color="muted">
          Tous vos supports de cours au même endroit
        </Text>
      </Box>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {myTrainings.length > 0 ? (
          myTrainings.map((training) => (
            <Box key={training.id} marginBottom="xl">
              {/* Titre de la formation */}
              <Box flexDirection="row" alignItems="center" marginBottom="m">
                <BookOpen size={18} color="#2563EB" />
                <Text
                  variant="body"
                  fontWeight="bold"
                  marginLeft="s"
                  color="primary"
                >
                  {training.title}
                </Text>
              </Box>

              {/* Liste des ressources */}
              <Box
                backgroundColor="white"
                borderRadius="l"
                padding="s"
                style={styles.card}
              >
                {!training.resources || training.resources.length === 0 ? (
                  <Box padding="m" alignItems="center">
                    <Text variant="caption" color="muted">
                      Aucun document partagé pour le moment
                    </Text>
                  </Box>
                ) : (
                  training.resources.map((res, index) => (
                    <ResourceItem
                      key={res.url ?? index}
                      title={res.name}
                      type={res.type}
                      url={res.url}
                      isLast={index === training.resources.length - 1}
                    />
                  ))
                )}
              </Box>
            </Box>
          ))
        ) : (
          <Box
            padding="xl"
            alignItems="center"
            justifyContent="center"
            backgroundColor="white"
            borderRadius="l"
            style={styles.card}
          >
            <Text
              variant="body"
              color="muted"
              textAlign="center"
              marginBottom="l"
              style={styles.emptyText}
            >
              Inscrivez-vous à une formation pour accéder aux ressources et
              suivre votre progression.
            </Text>
            <JoinTrainingModal
              trigger={({ open }) => (
                <Button
                  title="Rejoindre une formation"
                  variant="primary"
                  onPress={open}
                  icon={<ArrowRight size={20} color="white" />}
                  iconPosition="right"
                />
              )}
              onSuccess={(result) => {
                router.push({
                  pathname: "/(learner-tabs)/my-trainings/[id]",
                  params: { id: result.trainingId },
                });
              }}
            />
          </Box>
        )}
      </ScrollView>
    </Box>
  );
}

function ResourceItem({ title, type, url, isLast }) {
  const handleOpen = () => {
    if (url) Linking.openURL(url);
  };

  return (
    <TouchableOpacity onPress={handleOpen} activeOpacity={0.7}>
      <Box
        flexDirection="row"
        alignItems="center"
        padding="m"
        borderBottomWidth={isLast ? 0 : 1}
        borderBottomColor="secondaryBackground"
      >
        <Box
          width={40}
          height={40}
          borderRadius="m"
          backgroundColor="#F3F4F6"
          justifyContent="center"
          alignItems="center"
        >
          <FileText size={20} color="#6B7280" />
        </Box>
        <Box flex={1} marginLeft="m">
          <Text variant="body" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="caption" color="muted">
            {type?.toUpperCase() ?? "FICHIER"}
          </Text>
        </Box>
        <Download size={20} color="#2563EB" />
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyText: {
    lineHeight: 22,
  },
});
