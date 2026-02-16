import { useAuth } from "@/components/constants/authContext";
import { MyLoader } from "@/components/ui/loader";
import { Snack } from "@/components/ui/snackbar";
import { Box, Text } from "@/components/ui/theme";
import { router } from "expo-router";
import { BookOpen, ChevronRight, Clock, Plus } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { JoinTrainingModal } from "../(modal)/learnerModal/joinTrainingModal";
import { useJoinTraining } from "../../components/features/learnerProfile/hooks/useJoindTrainings";
import { useLearnerTrainings } from "../../components/features/learnerProfile/hooks/useLearnerTrainings";
import { ProgressBar } from "../../components/features/learnerProfile/learnerProgress";

export default function LearnerDashboard() {
  const { user } = useAuth();
  const { myTrainings, loading } = useLearnerTrainings(user?.uid);
  const { joinByCode, loading: joinLoading } = useJoinTraining();

  // États locaux pour le snack et le modal
  const [isModalVisible, setModalVisible] = useState(false);
  const [snack, setSnack] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showSnack = (message, type = "success") => {
    setSnack({ visible: true, message, type });
  };

  const handleJoin = async (code) => {
    const result = await joinByCode(code, user.uid);

    if (result.success) {
      showSnack(`Félicitations ! Vous avez rejoint ${result.title}`, "success");

      // On attend un tout petit peu que l'utilisateur voit le message de succès
      setTimeout(() => {
        setModalVisible(false); // On ferme le modal

        // 🚀 REDIRECTION vers l'écran de détails
        // Assure-toi que le chemin correspond à ta structure de dossiers
        router.push({
          pathname: "/(learner-tabs)/my-trainings/[id]", // ou le nom de ton fichier de détail
          params: { id: result.trainingId }, // On passe l'ID pour charger les données
        });
      }, 1500);

      return true;
    } else {
      showSnack(result.message, "error");
      return false;
    }
  };

  if (loading) return <MyLoader message="Chargement de vos cours..." />;

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Header avec ton style habituel */}
        <Box marginTop="xl" marginBottom="xl">
          <Text variant="hero">Salut, {user?.name?.split(" ")[0]} 👋</Text>
          <Text variant="body" color="muted">
            Prêt pour votre leçon du jour ?
          </Text>
        </Box>

        {/* Stats */}
        <Box flexDirection="row" gap="m" marginBottom="l">
          <StatCard
            icon={<BookOpen size={20} color="#2563EB" />}
            label="Formations"
            value={myTrainings.length.toString()}
          />
          <StatCard
            icon={<Clock size={20} color="#6B7280" />}
            label="En cours"
            value={myTrainings
              .filter((t) => t.status === "active")
              .length.toString()}
          />
        </Box>

        <Text variant="title" marginBottom="m">
          Mes formations
        </Text>

        {myTrainings.length > 0 ? (
          myTrainings.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() =>
                router.push(`/(learner-tabs)/my-trainings/${item.id}`)
              }
            >
              <Box
                backgroundColor="white"
                padding="m"
                borderRadius="l"
                marginBottom="m"
                style={styles.card}
              >
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box flex={1}>
                    <Text variant="body" fontWeight="bold">
                      {item.title}
                    </Text>
                    <Text variant="caption" color="muted">
                      {item.category}
                    </Text>
                  </Box>
                  <ChevronRight size={20} color="#6B7280" />
                </Box>

                {/* On affiche la progression (exemple statique pour l'instant) */}
                <ProgressBar progress={35} label="Progression globale" />
              </Box>
            </TouchableOpacity>
          ))
        ) : (
          <Box
            padding="xl"
            alignItems="center"
            backgroundColor="white"
            borderRadius="l"
            style={styles.card}
          >
            <Text color="muted" textAlign="center">
              Vous n&apos;êtes inscrit à aucun cours. Cliquez sur le + pour
              rejoindre une formation !
            </Text>
          </Box>
        )}
      </ScrollView>

      {/* Modal & Feedback */}
      <JoinTrainingModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onJoin={handleJoin}
        loading={joinLoading}
      />

      <Snack
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={() => setSnack({ ...snack, visible: false })}
      />

      {/* Bouton Flottant stylé */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={30} color="white" />
      </TouchableOpacity>
    </Box>
  );
}

// Composant Interne StatCard
function StatCard({ icon, label, value }) {
  return (
    <Box
      flex={1}
      padding="m"
      backgroundColor="white"
      borderRadius="m"
      alignItems="center"
      style={styles.statCard}
    >
      {icon}
      <Text variant="caption" color="muted" marginTop="xs">
        {label}
      </Text>
      <Text variant="body" fontWeight="bold" color="primary">
        {value}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statCard: {
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#2563EB",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#2563EB",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
