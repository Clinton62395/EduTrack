// ─────────────────────────────────────────
// 🧩 CERTIFICATE ELIGIBLE
// ─────────────────────────────────────────

import { Award, Sparkles } from "lucide-react-native";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { hs, ms, vs } from "../../../ui/theme";

export function CertificateEligible({ error, generating, onGenerate }) {
  return (
    <View style={styles.stateContainer}>
      <View style={[styles.stateBadge, { backgroundColor: "#EFF6FF" }]}>
        <View style={styles.stateBadgeRing}>
          <Award size={48} color="#2563EB" />
        </View>
      </View>

      <Text style={styles.stateTitle}>Formation complétée ! 🎓</Text>
      <Text style={styles.stateSub}>
        Vous avez validé toutes les leçons et tous les quiz.{"\n"}
        Votre certificat est prêt à être généré.
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        onPress={onGenerate}
        disabled={generating}
        style={[
          styles.generateButton,
          generating && styles.generateButtonDisabled,
        ]}
        activeOpacity={0.85}
      >
        {generating ? (
          <>
            <ActivityIndicator
              size="small"
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.generateButtonText}>
              Génération en cours...
            </Text>
          </>
        ) : (
          <>
            <Sparkles size={18} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.generateButtonText}>
              Générer mon certificat
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────
// 🎓 style
// ─────────────────────────────────────────

const styles = StyleSheet.create({
  stateContainer: {
    alignItems: "center",
    paddingTop: vs(16),
  },

  stateBadge: {
    width: hs(120),
    height: vs(120),
    borderRadius: ms(60),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: vs(24),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: ms(12),
        shadowOffset: { width: 0, height: vs(4) },
      },
      android: { elevation: ms(3) },
    }),
  },

  stateBadgeRing: {
    width: hs(90),
    height: vs(90),
    borderRadius: ms(45),
    borderWidth: ms(2),
    borderColor: "#BFDBFE",
    justifyContent: "center",
    alignItems: "center",
  },

  stateTitle: {
    fontSize: ms(22),
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: vs(10),
  },

  stateSub: {
    fontSize: ms(14),
    color: "#64748B",
    textAlign: "center",
    lineHeight: vs(22),
    marginBottom: vs(28),
    paddingHorizontal: ms(16),
  },

  errorText: {
    fontSize: ms(13),
    color: "#DC2626",
    textAlign: "center",
    marginBottom: vs(16),
  },

  // GENERATE BUTTON
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: vs(15),
    paddingHorizontal: ms(32),
    borderRadius: ms(14),
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOpacity: 0.35,
        shadowRadius: ms(10),
        shadowOffset: { width: 0, height: vs(4) },
      },
      android: { elevation: ms(5) },
    }),
  },

  generateButtonDisabled: {
    backgroundColor: "#93C5FD",
  },

  generateButtonText: {
    color: "white",
    fontSize: ms(15),
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
