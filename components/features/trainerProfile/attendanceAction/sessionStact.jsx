import { Box, Text } from "@/components/ui/theme";
import {
    CalendarCheck,
    ChevronRight,
    Clock,
    UserCheck,
    UserX,
} from "lucide-react-native";
import { StyleSheet, TouchableOpacity } from "react-native";

// ─────────────────────────────────────────
// 📋 CARTE SESSION
// ─────────────────────────────────────────
export function SessionCard({ session, expanded, onToggle }) {
  const date = session.createdAt?.toDate?.();
  const dateStr = date
    ? date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "Date inconnue";
  const timeStr = date
    ? date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const percentage =
    session.totalCount > 0
      ? Math.round((session.presentCount / session.totalCount) * 100)
      : 0;

  const presenceColor =
    percentage >= 75 ? "#10B981" : percentage >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <Box
      backgroundColor="white"
      borderRadius="l"
      marginBottom="s"
      overflow="hidden"
      style={styles.card}
    >
      {/* En-tête */}
      <TouchableOpacity activeOpacity={0.8} onPress={onToggle}>
        <Box padding="m">
          <Box flexDirection="row" alignItems="center" gap="m">
            <Box
              width={44}
              height={44}
              borderRadius="m"
              backgroundColor="successLight"
              justifyContent="center"
              alignItems="center"
            >
              <CalendarCheck size={22} color="#2563EB" />
            </Box>

            <Box flex={1}>
              <Text variant="body" fontWeight="bold" numberOfLines={1}>
                {dateStr}
              </Text>
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Clock size={12} color="#6B7280" />
                <Text variant="caption" color="muted">
                  {timeStr}
                </Text>
              </Box>
            </Box>

            <Box alignItems="flex-end" marginRight="s">
              <Text
                variant="body"
                fontWeight="bold"
                style={{ color: presenceColor }}
              >
                {session.presentCount}/{session.totalCount}
              </Text>
              <Text variant="caption" style={{ color: presenceColor }}>
                {percentage}%
              </Text>
            </Box>

            <ChevronRight
              size={18}
              color="#6B7280"
              style={{
                transform: [{ rotate: expanded ? "90deg" : "0deg" }],
              }}
            />
          </Box>

          {/* Barre de progression */}
          <Box
            height={4}
            backgroundColor="secondaryBackground"
            borderRadius="rounded"
            overflow="hidden"
            marginTop="m"
          >
            <Box
              height={4}
              borderRadius="rounded"
              style={{
                width: `${percentage}%`,
                backgroundColor: presenceColor,
              }}
            />
          </Box>
        </Box>
      </TouchableOpacity>

      {/* Détail présents/absents */}
      {expanded && (
        <Box borderTopWidth={1} borderTopColor="border" padding="m" gap="s">
          {/* Présents */}
          {session.presentLearners.length > 0 && (
            <Box>
              <Box
                flexDirection="row"
                alignItems="center"
                gap="xs"
                marginBottom="s"
              >
                <UserCheck size={16} color="#10B981" />
                <Text
                  variant="caption"
                  fontWeight="bold"
                  style={{ color: "#10B981" }}
                >
                  Présents ({session.presentLearners.length})
                </Text>
              </Box>
              {session.presentLearners.map((learner) => (
                <LearnerRow
                  key={learner.userId}
                  name={learner.userName}
                  status="present"
                />
              ))}
            </Box>
          )}

          {/* Absents */}
          {session.absentLearners.length > 0 && (
            <Box marginTop="s">
              <Box
                flexDirection="row"
                alignItems="center"
                gap="xs"
                marginBottom="s"
              >
                <UserX size={16} color="#EF4444" />
                <Text
                  variant="caption"
                  fontWeight="bold"
                  style={{ color: "#EF4444" }}
                >
                  Absents ({session.absentLearners.length})
                </Text>
              </Box>
              {session.absentLearners.map((learner) => (
                <LearnerRow
                  key={learner.userId}
                  name={learner.userName}
                  status="absent"
                />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

function LearnerRow({ name, status }) {
  const isPresent = status === "present";
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      gap="m"
      paddingVertical="xs"
      paddingHorizontal="s"
      borderRadius="m"
      backgroundColor={isPresent ? "successLight" : "dangerLight"}
      marginBottom="xs"
    >
      <Box
        width={8}
        height={8}
        borderRadius="rounded"
        backgroundColor={isPresent ? "success" : "danger"}
      />
      <Text variant="caption" flex={1} color={isPresent ? "success" : "danger"}>
        {name}
      </Text>
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
  dropdownCard: {
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
});
