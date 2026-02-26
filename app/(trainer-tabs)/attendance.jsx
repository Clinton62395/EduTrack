import { useAuth } from "@/components/constants/authContext";
import { useAttendanceHistory } from "@/components/features/trainerProfile/hooks/useAttendanceHistory";
import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import { useTrainings } from "@/hooks/useTraining";
import { CalendarCheck, ChevronDown, Users } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DropdownModal } from "../../components/features/trainerProfile/attendanceAction/attendanceDropdwon";
import {
  EmptySelection,
  EmptySessions,
} from "../../components/features/trainerProfile/attendanceAction/attendanceEmptyContent";
import { SessionCard } from "../../components/features/trainerProfile/attendanceAction/sessionStact";

export default function TrainerAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { trainings, loading: trainingsLoading } = useTrainings();

  const [selectedTraining, setSelectedTraining] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);

  const { sessions, loading: sessionsLoading } = useAttendanceHistory(
    selectedTraining?.id,
  );

  if (trainingsLoading)
    return <MyLoader message="Chargement des historiques..." />;

  return (
    <Box
      flex={1}
      backgroundColor="secondaryBackground"
      style={{ paddingTop: insets.top }}
    >
      {/* ─── HEADER ─── */}
      <Box
        backgroundColor="white"
        paddingHorizontal="l"
        paddingVertical="m"
        borderBottomWidth={1}
        borderBottomColor="border"
      >
        <Text variant="title">Présence</Text>
        <Text variant="caption" color="muted">
          Historique des sessions
        </Text>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── DROPDOWN ─── */}
        <Text variant="caption" color="muted" marginBottom="s">
          Formation
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setDropdownVisible(true)}
        >
          <Box
            backgroundColor="white"
            borderRadius="l"
            padding="m"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            borderWidth={1}
            borderColor="border"
            marginBottom="l"
            style={styles.card}
          >
            <Text
              variant="body"
              color={selectedTraining ? "text" : "muted"}
              flex={1}
              numberOfLines={1}
            >
              {selectedTraining?.title || "Sélectionner une formation..."}
            </Text>
            <ChevronDown size={20} color="#6B7280" />
          </Box>
        </TouchableOpacity>

        {/* ─── CONTENU ─── */}
        {!selectedTraining ? (
          <EmptySelection />
        ) : sessionsLoading ? (
          <MyLoader message="Chargement des sessions..." />
        ) : sessions.length === 0 ? (
          <EmptySessions />
        ) : (
          <>
            <GlobalStats sessions={sessions} />

            <Text
              variant="body"
              fontWeight="bold"
              marginTop="l"
              marginBottom="m"
            >
              Sessions ({sessions.length})
            </Text>

            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                expanded={expandedSession === session.id}
                onToggle={() =>
                  setExpandedSession(
                    expandedSession === session.id ? null : session.id,
                  )
                }
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* ─── MODAL DROPDOWN ─── */}
      <DropdownModal
        visible={dropdownVisible}
        trainings={trainings}
        selected={selectedTraining}
        onSelect={(training) => {
          setSelectedTraining(training);
          setExpandedSession(null);
          setDropdownVisible(false);
        }}
        onClose={() => setDropdownVisible(false)}
      />
    </Box>
  );
}

// ─────────────────────────────────────────
// 📊 STATS GLOBALES
// ─────────────────────────────────────────
function GlobalStats({ sessions }) {
  const totalSessions = sessions.length;
  const avgPresence =
    totalSessions > 0
      ? Math.round(
          (sessions.reduce(
            (acc, s) =>
              acc + (s.totalCount > 0 ? s.presentCount / s.totalCount : 0),
            0,
          ) /
            totalSessions) *
            100,
        )
      : 0;

  return (
    <Box flexDirection="row" gap="m">
      <Box
        flex={1}
        backgroundColor="white"
        borderRadius="l"
        padding="m"
        alignItems="center"
        style={styles.card}
      >
        <CalendarCheck size={24} color="#2563EB" />
        <Text variant="body" fontWeight="bold" marginTop="xs">
          {totalSessions}
        </Text>
        <Text variant="caption" color="muted">
          Sessions
        </Text>
      </Box>
      <Box
        flex={1}
        backgroundColor="white"
        borderRadius="l"
        padding="m"
        alignItems="center"
        style={styles.card}
      >
        <Users size={24} color="#10B981" />
        <Text variant="body" fontWeight="bold" marginTop="xs">
          {avgPresence}%
        </Text>
        <Text variant="caption" color="muted">
          Présence moy.
        </Text>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
});
