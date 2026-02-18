import { Box, Text } from "@/components/ui/theme";
import { Clock } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { useTrainerAttendance } from "./hooks/useTrainerAttendance";

export function TrainerAttendanceControl({ trainingId }) {
  const { startNewSession, activeCode, loading } = useTrainerAttendance();

  const [sessionStarted, setSessionStarted] = useState(false);

  const handleStart = async () => {
    await startNewSession(trainingId);
    setSessionStarted(true);
  };

  return (
    <Box
      backgroundColor="white"
      padding="l"
      borderRadius="xl"
      borderWidth={1}
      borderColor="border"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
    >
      <Text variant="title" marginBottom="s">
        Appel du jour
      </Text>

      {!sessionStarted ? (
        <Box>
          <Text variant="body" color="muted" marginBottom="l">
            Générez un code temporaire pour valider la présence de vos élèves.
          </Text>
          <TouchableOpacity onPress={handleStart} disabled={loading}>
            <Box
              backgroundColor="primary"
              padding="m"
              borderRadius="m"
              alignItems="center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text color="white" fontWeight="bold">
                  Générer le code
                </Text>
              )}
            </Box>
          </TouchableOpacity>
        </Box>
      ) : (
        <Box alignItems="center">
          <Text variant="caption" color="muted">
            Code de présence (valide 15 min)
          </Text>
          <Text
            style={{
              fontSize: 48,
              fontWeight: "bold",
              color: "#007AFF",
              letterSpacing: 10,
            }}
          >
            {activeCode}
          </Text>

          <Box flexDirection="row" marginTop="m" alignItems="center">
            <Clock size={16} color="gray" />
            <Text variant="caption" marginLeft="s" color="muted">
              Expire bientôt...
            </Text>
          </Box>

          <TouchableOpacity
            onPress={() => setSessionStarted(false)}
            style={{ marginTop: 15 }}
          >
            <Text color="error">Terminer la session</Text>
          </TouchableOpacity>
        </Box>
      )}
    </Box>
  );
}
