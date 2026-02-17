import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase";
import { Box, Text } from "@/components/ui/theme";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Calendar, CheckCircle, XCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    // On écoute les présences de l'utilisateur
    const q = query(
      collection(db, "attendance"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAttendanceHistory(data);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      <Box
        padding="l"
        backgroundColor="white"
        borderBottomLeftRadius="xl"
        borderBottomRightRadius="xl"
      >
        <Text variant="title">Ma Présence</Text>
        <Text variant="caption" color="muted">
          Suivi de votre ponctualité
        </Text>
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
    </Box>
  );
}

function AttendanceRow({ record }) {
  const isPresent = record.status === "present";

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
            {record.trainingName || "Formation"}
          </Text>
          <Text variant="caption" color="muted">
            {new Date(record.timestamp?.toDate()).toLocaleDateString()}
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
