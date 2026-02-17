import { useAuth } from "@/components/constants/authContext";
import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import { BookOpen, Download, FileText } from "lucide-react-native";
import { useState } from "react";
import { Linking, ScrollView, TouchableOpacity } from "react-native";
import { JoinTrainingModal } from "../(modal)/learnerModal/joinTrainingModal";
import { useLearnerTrainings } from "../../components/features/learnerProfile/hooks/useLearnerTrainings";

export default function LearnerResourcesScreen() {
  const { user } = useAuth();
  const { myTrainings, loading } = useLearnerTrainings(user?.uid);
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) return <MyLoader message="Chargement des ressources..." />;

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* HEADER SIMPLE */}
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

              {/* Liste des ressources de cette formation */}
              <Box
                backgroundColor="white"
                borderRadius="l"
                padding="s"
                style={{ elevation: 2 }}
              >
                {/* Cas où il n'y a pas encore de fichiers */}
                {!training.resources || training.resources.length === 0 ? (
                  <Box padding="m" alignItems="center">
                    <Text variant="caption" color="muted">
                      Aucun document partagé pour le moment
                    </Text>
                  </Box>
                ) : (
                  training.resources.map((res, index) => (
                    <ResourceItem
                      key={index}
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
            flex={1}
            padding="xl"
            alignItems="center"
            justifyContent="center"
            backgroundColor="white"
            borderRadius="l"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text
              variant="body"
              color="muted"
              textAlign="center"
              marginBottom="l"
              style={{ lineHeight: 22 }}
            >
              Inscrivez-vous à une formation pour accéder aux ressources et
              suivre votre progression.
            </Text>

            <Box position="absolute" bottom={0} left={0} right={20}>
              <JoinTrainingModal />
            </Box>
          </Box>
        )}
      </ScrollView>
    </Box>
  );
}

// Sous-composant pour chaque fichier
function ResourceItem({ title, type, url, isLast }) {
  const handleOpen = () => {
    if (url) Linking.openURL(url);
  };

  return (
    <TouchableOpacity onPress={handleOpen}>
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
            {type.toUpperCase()}
          </Text>
        </Box>
        <Download size={20} color="#2563EB" />
      </Box>
    </TouchableOpacity>
  );
}
