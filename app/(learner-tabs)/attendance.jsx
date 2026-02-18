import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase";
import { Box, Text } from "@/components/ui/theme";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Calendar, CheckCircle, UserCheck, XCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { AttendanceModal } from "../(modal)/learnerModal/attendanceModal";

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "attendance"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Tri par date décroissante (le plus récent en haut)
      setAttendanceHistory(
        data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds),
      );
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // On récupère l'ID de la première formation rejointe
  const currentTrainingId = user?.enrolledTrainings?.[0] || "";

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      <Box
        padding="l"
        backgroundColor="white"
        borderBottomLeftRadius="xl"
        borderBottomRightRadius="xl"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Text variant="title">Ma Présence</Text>
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
      />
    </Box>
  );
}

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
