import { useAuth } from "@/components/constants/authContext";
import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import {
  Calendar,
  CheckCircle,
  Clock,
  UserCheck,
  XCircle,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import AttendanceModal from "../(modal)/learnerModal/attendanceModal";
import { useLearnerAttendance } from "../../components/features/learnerProfile/hooks/useLearnerAttendance";

export default function AttendanceScreen() {
  const { user, loading: authLoading } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "present" | "absent"

  const trainingIds = user?.enrolledTrainings || [];

  // On récupère fullHistory (qui contient présents ET absents) et stats
  const { fullHistory, activeSession, stats, loading } = useLearnerAttendance(
    user?.uid,
    trainingIds,
  );

  // 🪄 Filtrage mémorisé pour éviter de recalculer à chaque rendu
  const filteredData = useMemo(() => {
    if (activeFilter === "all") return fullHistory;
    return fullHistory.filter((item) => item.status === activeFilter);
  }, [fullHistory, activeFilter]);

  if (authLoading || loading) {
    return <MyLoader message="Analyse de votre assiduité..." />;
  }

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* HEADER AVEC STATS */}
      <Box
        padding="l"
        backgroundColor="white"
        borderBottomLeftRadius="xl"
        borderBottomRightRadius="xl"
        elevation={2}
      >
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="m"
          marginTop="l"
        >
          <Box>
            <Text variant="hero">Ma Présence</Text>
            <Text variant="caption" color="muted">
              Taux d&apos;assiduité : {stats?.rate || 0}%
            </Text>
          </Box>
          <TouchableOpacity
            onPress={() => activeSession && setModalVisible(true)}
            style={[
              styles.actionBtn,
              { backgroundColor: activeSession ? "#007AFF" : "#F3F4F6" },
            ]}
          >
            <UserCheck color={activeSession ? "white" : "#9CA3AF"} size={24} />
          </TouchableOpacity>
        </Box>

        {/* ONGLES DE FILTRAGE (La méthode magique pour l'UX) */}
        <Box flexDirection="row" gap="s" marginTop="s">
          <FilterTab
            label="Tout"
            active={activeFilter === "all"}
            onPress={() => setActiveFilter("all")}
            count={fullHistory.length}
          />
          <FilterTab
            label="Absences"
            active={activeFilter === "absent"}
            onPress={() => setActiveFilter("absent")}
            count={stats?.absent}
            color="#EF4444"
          />
          <FilterTab
            label="Présents"
            active={activeFilter === "present"}
            onPress={() => setActiveFilter("present")}
            count={stats?.present}
            color="#10B981"
          />
        </Box>
      </Box>

      {/* BANNIÈRE ACTIVE */}
      {activeSession && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{ paddingHorizontal: 20, marginTop: 15 }}
        >
          <Box
            backgroundColor="primary"
            padding="m"
            borderRadius="l"
            flexDirection="row"
            alignItems="center"
          >
            <Clock color="white" size={20} />
            <Text marginLeft="m" flex={1} color="white" fontWeight="bold">
              Appel en cours : {activeSession.title}
            </Text>
            <Text color="white" variant="caption" fontWeight="bold">
              VITE !
            </Text>
          </Box>
        </TouchableOpacity>
      )}

      {/* LISTE PERFORMANTE (FlatList remplace ScrollView) */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        initialNumToRender={10} // Ne dessine que 10 éléments au début
        renderItem={({ item }) => <AttendanceRow record={item} />}
        ListEmptyComponent={
          <Box padding="xl" alignItems="center">
            <Calendar size={48} color="#D1D5DB" />
            <Text marginTop="m" color="muted">
              Aucun enregistrement trouvé.
            </Text>
          </Box>
        }
      />

      <AttendanceModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        trainingId={activeSession?.trainingId || trainingIds[0]}
        trainingTitle={activeSession?.title || "Ma Formation"}
        expiresAt={activeSession?.expiresAt}
      />
    </Box>
  );
}

// --- SOUS-COMPOSANTS ---

function FilterTab({ label, active, onPress, count, color = "#007AFF" }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tab,
        active && { backgroundColor: color, borderColor: color },
      ]}
    >
      <Text
        variant="caption"
        fontWeight="bold"
        style={{ color: active ? "white" : "gray" }}
      >
        {label} ({count || 0})
      </Text>
    </TouchableOpacity>
  );
}

function AttendanceRow({ record }) {
  const isPresent = record.status === "present";
  const date = record.date; // Le hook renvoie déjà un objet Date native

  return (
    <Box
      backgroundColor="white"
      padding="m"
      borderRadius="m"
      marginBottom="s"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      style={styles.shadow}
    >
      <Box flexDirection="row" alignItems="center" flex={1}>
        {isPresent ? (
          <CheckCircle size={22} color="#10B981" />
        ) : (
          <XCircle size={22} color="#EF4444" />
        )}
        <Box marginLeft="m" flex={1}>
          <Text variant="body" fontWeight="bold" numberOfLines={1}>
            {record.title}
          </Text>
          <Text variant="caption" color="muted">
            {date
              ? date.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Date inconnue"}
          </Text>
        </Box>
      </Box>
      <Box
        backgroundColor={isPresent ? "successLight" : "dangerLight"}
        paddingHorizontal="s"
        paddingVertical="xs"
        borderRadius="s"
      >
        <Text
          variant="caption"
          fontWeight="bold"
          style={{ color: isPresent ? "successDark" : "dangerDark" }}
        >
          {isPresent ? "PRÉSENT" : "ABSENT"}
        </Text>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  actionBtn: { padding: 12, borderRadius: 12 },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
