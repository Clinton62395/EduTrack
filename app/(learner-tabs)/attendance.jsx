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
import { useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { AttendanceModal } from "../(modal)/learnerModal/attendanceModal";
import { useLearnerAttendance } from "../../components/features/learnerProfile/hooks/useLearnerAttendance";
import { useLearnerTrainings } from "../../components/features/learnerProfile/hooks/useLearnerTrainings";

export default function AttendanceScreen() {
  const { user, loading: authLoading } = useAuth(); // Récupère l'état de chargement si tu l'as

  const [isModalVisible, setModalVisible] = useState(false);
  const { myTrainings } = useLearnerTrainings(user?.uid);

  // ✅ Toutes les formations de l'apprenant
  const trainingIds = user?.enrolledTrainings || [];

  const { attendanceHistory, activeSession, loading } = useLearnerAttendance(
    user?.uid,
    trainingIds, // ← tableau au lieu d'un seul ID
  );

  if (authLoading) {
    return <MyLoader message="Chargement de vos cours..." />;
  }

  // 2. Si c'est un formateur, on affiche un message au lieu de bloquer
  if (user?.role === "trainer") {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="xl"
        gap="m"
      >
        <Text variant="hero">Mode Formateur</Text>
        <Text textAlign="center" color="muted">
          En tant que formateur, vous gérez les appels depuis l&apos;onglet
          Formation. L&apos;historique de présence est réservé aux apprenants.
        </Text>
      </Box>
    );
  }

  // 3. Si c'est un élève, on récupère ses formations
  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* HEADER */}
      <Box
        padding="l"
        marginVertical="l"
        backgroundColor="white"
        borderBottomLeftRadius="xl"
        borderBottomRightRadius="xl"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Text variant="hero">Ma Présence</Text>
          <Text variant="caption" color="muted">
            Suivi de votre ponctualité
          </Text>
        </Box>
        <TouchableOpacity
          onPress={() => {
            if (!activeSession) return;
            setModalVisible(true);
          }}
          style={{
            backgroundColor: !activeSession ? "#F3F4F6" : "#007AFF",
            padding: 12,
            borderRadius: 12,
          }}
        >
          <UserCheck color="white" size={24} />
        </TouchableOpacity>
      </Box>

      {/* fallback if no active session */}
      {!activeSession && (
        <Box padding="m" alignItems="center" borderRadius="lg">
          <Text variant="caption" color="muted">
            Aucun appel en cours pour le moment.
          </Text>
        </Box>
      )}

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* --- BANNIÈRE DE SESSION ACTIVE --- */}
        {activeSession && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Box
              backgroundColor="primary"
              padding="m"
              borderRadius="l"
              marginBottom="l"
              flexDirection="row"
              alignItems="center"
            >
              <Clock color="white" size={20} />
              <Box marginLeft="m" flex={1}>
                <Text color="white" fontWeight="bold">
                  Appel en cours !
                </Text>
                <Text color="white" variant="caption">
                  Appuyez ici pour valider votre présence
                </Text>
              </Box>
              <Box
                backgroundColor="warningBackground"
                paddingHorizontal="s"
                borderRadius="s"
              >
                <Text variant="caption" fontWeight="bold" color="warning">
                  VITE
                </Text>
              </Box>
            </Box>
          </TouchableOpacity>
        )}

        {/* --- HISTORIQUE --- */}
        {attendanceHistory.length === 0 ? (
          <Box padding="xl" alignItems="center">
            <Calendar size={48} color="#D1D5DB" />
            <Text marginTop="m" color="muted">
              Aucun historique de présence disponible.
            </Text>
          </Box>
        ) : (
          attendanceHistory.map((item) => (
            <AttendanceRow key={item.id} record={item} />
          ))
        )}
      </ScrollView>

      <AttendanceModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        trainingId={activeSession?.trainingId || trainingIds[0]}
        trainingTitle={activeSession?.trainingTitle || "Ma Formation"}
        expiresAt={activeSession?.expiresAt}
      />
    </Box>
  );
}

// ... Ton composant AttendanceRow reste identique

// --- LE COMPOSANT INDISPENSABLE POUR L'AFFICHAGE ---
function AttendanceRow({ record }) {
  const isPresent = record.status === "present";
  const date = record.timestamp ? new Date(record.timestamp.toDate()) : null;

  const dateStr = date
    ? date.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }) +
      " à " +
      date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "...";

  return (
    <Box
      backgroundColor="white"
      padding="m"
      borderRadius="m"
      marginBottom="s"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box flexDirection="row" alignItems="center">
        {isPresent ? (
          <CheckCircle size={20} color="#10B981" />
        ) : (
          <XCircle size={20} color="#EF4444" />
        )}
        <Box marginLeft="m">
          <Text variant="body" fontWeight="bold">
            {record.trainingTitle || "Formation"}
          </Text>
          <Text variant="caption" color="muted">
            {dateStr}
          </Text>
        </Box>
      </Box>
      <Box
        backgroundColor={isPresent ? "successLight" : "secondaryBackground"}
        paddingHorizontal="s"
        borderRadius="s"
      >
        <Text style={{ color: isPresent ? "success" : "danger", fontSize: 12 }}>
          {isPresent ? "Présent" : "Absent"}
        </Text>
      </Box>
    </Box>
  );
}
