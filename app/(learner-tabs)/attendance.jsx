import { useAuth } from "@/components/constants/authContext";
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
  const { user } = useAuth();
  const currentTrainingId = user?.enrolledTrainings?.[0] || "";
  const [isModalVisible, setModalVisible] = useState(false);
  const { myTrainings } = useLearnerTrainings(user?.uid);

  // Utilisation du hook
  const { attendanceHistory, activeSession } = useLearnerAttendance(
    user?.uid,
    currentTrainingId,
  );

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
          onPress={() => setModalVisible(true)}
          style={{ backgroundColor: "#007AFF", padding: 12, borderRadius: 12 }}
        >
          <UserCheck color="white" size={24} />
        </TouchableOpacity>
      </Box>

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
                <Text  variant="caption" fontWeight="bold">
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
        trainingId={currentTrainingId}
        trainingTitle={myTrainings[0]?.title}
      />
    </Box>
  );
}

// ... Ton composant AttendanceRow reste identique

// --- LE COMPOSANT INDISPENSABLE POUR L'AFFICHAGE ---
function AttendanceRow({ record }) {
  const isPresent = record.status === "present";

  // Formatage de la date (sécurité si le timestamp n'est pas encore revenu du serveur)
  const dateStr = record.timestamp
    ? new Date(record.timestamp.toDate()).toLocaleDateString()
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
        backgroundColor={isPresent ? "#D1FAE5" : "#FEE2E2"}
        paddingHorizontal="s"
        borderRadius="s"
      >
        <Text
          style={{ color: isPresent ? "#065F46" : "#991B1B", fontSize: 12 }}
        >
          {isPresent ? "Présent" : "Absent"}
        </Text>
      </Box>
    </Box>
  );
}
