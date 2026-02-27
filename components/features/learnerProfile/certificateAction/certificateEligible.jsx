// ─────────────────────────────────────────
// 🧩 CERTIFICATE ELIGIBLE
// ─────────────────────────────────────────

import { Award, Sparkles } from "lucide-react-native";
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";


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
    paddingTop: 16,
  },
  stateBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
    }),
  },
  stateBadgeRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#BFDBFE",
    justifyContent: "center",
    alignItems: "center",
  },
  stateTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  stateSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
  },

  // GÉNÉRER
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 5 },
    }),
  },
  generateButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  generateButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
