// ─────────────────────────────────────────
// QUIZ RESET MODAL
import { db } from "@/components/lib/firebase";
import { Text } from "@/components/ui/theme";
import {
  doc,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { CheckCircle2, XCircle } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// ─────────────────────────────────────────
export function QuizResetModal({ learner, onClose, MAX_ATTEMPTS }) {
  const [resetting, setResetting] = useState(null); // moduleId en cours de reset

  const handleReset = async (moduleId) => {
    try {
      setResetting(moduleId);
      const resultId = `${learner.id}_${moduleId}`;
      await updateDoc(doc(db, "quizResults", resultId), {
        attempts: 0,
        resetAt: serverTimestamp(),
        resetBy: "trainer",
      });
    } catch (e) {
      console.error("Erreur reset tentatives:", e);
    } finally {
      setResetting(null);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text variant="title" style={{ fontSize: 16 }}>
                Quiz — {learner.name}
              </Text>
              <Text variant="caption" color="muted">
                Résultats par module
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <XCircle size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {learner.quizResults?.map((quiz) => (
              <View key={quiz.moduleId} style={styles.quizRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="body" fontWeight="600" numberOfLines={1}>
                    {quiz.moduleTitle}
                  </Text>

                  {/* Statut */}
                  {quiz.attempts === 0 ? (
                    <Text variant="caption" color="muted">
                      Pas encore tenté
                    </Text>
                  ) : quiz.passed ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <CheckCircle2 size={12} color="#10B981" />
                      <Text variant="caption" style={{ color: "#10B981" }}>
                        Réussi — {quiz.percentage}%
                      </Text>
                    </View>
                  ) : (
                    <Text
                      variant="caption"
                      style={{
                        color: quiz.attemptsExhausted ? "#EF4444" : "#F59E0B",
                      }}
                    >
                      {quiz.attempts}/{MAX_ATTEMPTS} tentatives •{" "}
                      {quiz.percentage}%
                      {quiz.attemptsExhausted ? " — Épuisées" : ""}
                    </Text>
                  )}
                </View>

                {/* ✅ Bouton reset — uniquement si tentatives épuisées */}
                {quiz.attemptsExhausted && (
                  <TouchableOpacity
                    onPress={() => handleReset(quiz.moduleId)}
                    disabled={resetting === quiz.moduleId}
                    style={styles.resetButton}
                  >
                    {resetting === quiz.moduleId ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text
                        style={{
                          color: "white",
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        Réinitialiser
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  resetButton: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
});
