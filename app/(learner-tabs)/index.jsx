import { useAuth } from "@/components/constants/authContext";
import { MyLoader } from "@/components/ui/loader";
import { Text, ms } from "@/components/ui/theme";
import { router } from "expo-router";
import { BookOpen, ChevronRight, Clock } from "lucide-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import JoinTrainingModal from "../(modal)/learnerModal/joinTrainingModal";
import { EmptyState } from "../../components/features/learnerProfile/emptyState";
import { useLearnerTrainings } from "../../components/features/learnerProfile/hooks/useLearnerTrainings";
import { TrainingProgressCard } from "../../components/features/learnerProfile/learnerProgressCard";
import { DraggableJoinFab } from "../../components/helpers/dragguableButton";

// ─────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────
// ... tes imports

export default function LearnerDashboard() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // On récupère aussi une fonction de rafraîchissement si ton hook le permet
  const { myTrainings, loading, refresh } = useLearnerTrainings(user?.uid);

  const navigateToTraining = (moduleId) => {
    router.push({
      pathname: "/(learner-stack)/my-trainings/[moduleId]",
      params: { moduleId },
    });
  };

  if (loading && myTrainings.length === 0) {
    return <MyLoader message="Chargement de vos cours..." />;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {myTrainings.length === 0 && !loading ? (
        <EmptyState user={user} insets={insets} />
      ) : (
        <FlatList
          data={myTrainings}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={refresh} // Ajoute cette fonction à ton hook useLearnerTrainings
          contentContainerStyle={{ padding: ms(20), paddingBottom: ms(100) }}
          showsVerticalScrollIndicator={false}
          // On déplace le header et les stats ici
          ListHeaderComponent={
            <View style={styles.filledHeader}>
              <Text style={styles.filledGreeting}>
                Salut, {user?.name?.split(" ")[0]} 👋
              </Text>
              <Text style={styles.filledSub}>
                Prêt pour votre leçon du jour ?
              </Text>

              <View style={styles.filledStats}>
                <View style={styles.filledStatBox}>
                  <BookOpen size={18} color="#2563EB" />
                  <Text style={styles.filledStatValue}>
                    {myTrainings.length}
                  </Text>
                  <Text style={styles.filledStatLabel}>Formations</Text>
                </View>
                <View style={[styles.filledStatBox, styles.filledStatBorder]}>
                  <Clock size={18} color="#10B981" />
                  <Text style={styles.filledStatValue}>
                    {myTrainings.filter((t) => t.status === "published").length}
                  </Text>
                  <Text style={styles.filledStatLabel}>Actives</Text>
                </View>
              </View>
              <Text style={styles.filledSectionTitle}>Mes formations</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigateToTraining(item.id)}
            >
              <View style={styles.trainingCard}>
                <View style={styles.trainingCardInner}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trainingTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.trainingCategory}>{item.category}</Text>
                  </View>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
                {/* On passe l'objet item complet pour le calcul du progrès */}
                <TrainingProgressCard training={item} userId={user?.uid} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <JoinTrainingModal
        onSuccess={(result) => navigateToTraining(result.trainingId)}
        trigger={({ open }) => <DraggableJoinFab onPress={open} />}
      />
    </View>
  );
}

// ─────────────────────────────────────────
// DASHBOARD AVEC FORMATIONS
// ─────────────────────────────────────────
function FilledDashboard({ user, myTrainings, insets }) {
  return (
    <ScrollView
      contentContainerStyle={{ padding: ms(20), paddingBottom: ms(100) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.filledHeader}>
        <Text style={styles.filledGreeting}>
          Salut, {user?.name?.split(" ")[0]} 👋
        </Text>
        <Text style={styles.filledSub}>Prêt pour votre leçon du jour ?</Text>
      </View>

      {/* Stats */}
      <View style={styles.filledStats}>
        <View style={styles.filledStatBox}>
          <BookOpen size={18} color="#2563EB" />
          <Text style={styles.filledStatValue}>{myTrainings.length}</Text>
          <Text style={styles.filledStatLabel}>Formations</Text>
        </View>
        <View style={[styles.filledStatBox, styles.filledStatBorder]}>
          <Clock size={18} color="#10B981" />
          <Text style={styles.filledStatValue}>
            {myTrainings.filter((t) => t.status === "published").length}
          </Text>
          <Text style={styles.filledStatLabel}>Actives</Text>
        </View>
      </View>

      <Text style={styles.filledSectionTitle}>Mes formations</Text>

      {myTrainings.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/(learner-stack)/my-trainings/[moduleId]",
              params: { moduleId: item.id },
            })
          }
        >
          <View style={styles.trainingCard}>
            <View style={styles.trainingCardInner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.trainingTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.trainingCategory}>{item.category}</Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </View>
            <TrainingProgressCard training={item} userId={user?.uid} />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },

  // ── FILLED DASHBOARD ──
  filledHeader: { marginTop: ms(8), marginBottom: ms(20) },
  filledGreeting: {
    fontSize: ms(28),
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  filledSub: { fontSize: ms(14), color: "#64748B", marginTop: ms(4) },
  filledStats: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: ms(16),
    padding: ms(16),
    marginBottom: ms(24),
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: ms(8),
    elevation: ms(2),
  },
  filledStatBox: { flex: 1, alignItems: "center", gap: ms(4) },
  filledStatBorder: { borderLeftWidth: 1, borderLeftColor: "#F1F5F9" },
  filledStatValue: { fontSize: ms(22), fontWeight: "800", color: "#0F172A" },
  filledStatLabel: { fontSize: ms(12), color: "#94A3B8" },
  filledSectionTitle: {
    fontSize: ms(17),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: ms(12),
  },

  trainingCard: {
    backgroundColor: "white",
    borderRadius: ms(16),
    padding: ms(16),
    marginBottom: ms(12),
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: ms(8),
    elevation: ms(2),
  },
  trainingCardInner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ms(8),
  },
  trainingTitle: { fontSize: ms(15), fontWeight: "700", color: "#0F172A" },
  trainingCategory: { fontSize: ms(12), color: "#94A3B8", marginTop: ms(2) },
});
