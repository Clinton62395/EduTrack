// ─────────────────────────────────────────
// LEARNER ROW

import { Box, Text, hs, ms, vs } from "@/components/ui/theme";
import { Image } from "expo-image";
import { AlertTriangle, RefreshCw } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// ─────────────────────────────────────────
export function LearnerRow({ learner, onManageQuiz, MAX_ATTEMPTS }) {
  return (
    <Box
      backgroundColor="white"
      padding="m"
      borderRadius="l"
      marginBottom="s"
      style={styles.card}
    >
      <Box flexDirection="row" alignItems="center">
        <Box
          width={45}
          height={45}
          borderRadius="rounded"
          backgroundColor="secondaryBackground"
          justifyContent="center"
          alignItems="center"
          overflow="hidden"
        >
          {learner.avatar ? (
            <Image
              source={{ uri: learner.avatar }}
              style={{ width: 45, height: 45 }}
              contentFit="cover"
            />
          ) : (
            <Text fontWeight="bold" color="primary" style={{ fontSize: 18 }}>
              {learner.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          )}
        </Box>

        <Box flex={1} marginLeft="m">
          <Box flexDirection="row" alignItems="center" gap="s">
            <Text variant="body" fontWeight="bold">
              {learner.name || "Apprenant"}
            </Text>
            {/* ✅ Badge rouge si tentatives épuisées */}
            {learner.hasExhaustedAttempts && (
              <View style={styles.alertBadge}>
                <AlertTriangle size={10} color="white" />
              </View>
            )}
          </Box>
          <Text variant="caption" color="muted">
            {learner.email}
          </Text>
        </Box>

        <Box alignItems="flex-end" gap="xs">
          <Text variant="body" fontWeight="bold" color="primary">
            {learner.completedLessons}
          </Text>
          <Text variant="caption" color="muted">
            leçons
          </Text>
        </Box>
      </Box>

      {/* ✅ Bouton gérer quiz — visible si des quiz existent */}
      {learner.quizResults?.length > 0 && (
        <TouchableOpacity
          onPress={onManageQuiz}
          style={[
            styles.quizButton,
            learner.hasExhaustedAttempts && styles.quizButtonAlert,
          ]}
        >
          <RefreshCw
            size={14}
            color={learner.hasExhaustedAttempts ? "#EF4444" : "#6B7280"}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: learner.hasExhaustedAttempts ? "#EF4444" : "#6B7280",
              marginLeft: 6,
            }}
          >
            {learner.hasExhaustedAttempts
              ? "Tentatives épuisées — Gérer"
              : "Gérer les quiz"}
          </Text>
        </TouchableOpacity>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    elevation: ms(2),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: ms(8),
    shadowOffset: { width: 0, height: vs(2) },
  },

  alertBadge: {
    width: hs(16),
    height: vs(16),
    borderRadius: ms(8),
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },

  quizButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: vs(10),
    paddingTop: vs(10),
    borderTopWidth: 1, // ⚠️ garder fixe
    borderTopColor: "#F1F5F9",
  },

  quizButtonAlert: {
    borderTopColor: "#FEE2E2",
  },
});
