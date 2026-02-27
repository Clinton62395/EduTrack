import { Award } from "lucide-react-native";
import { Platform, Text, View, StyleSheet } from "react-native";

export function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      {/* BADGE */}
      <View style={styles.emptyBadgeOuter}>
        <View style={styles.emptyBadgeInner}>
          <Award size={40} color="#94A3B8" />
        </View>
      </View>

      {/* TEXT */}
      <Text style={styles.emptyTitle}>Aucune formation</Text>

      <Text style={styles.emptySubtitle}>
        Vous n'êtes inscrit à aucune formation pour le moment.
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────
// 🎨 STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  // EMPTY STATE
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
  },

  emptyBadgeOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 5 },
    }),
  },

  emptyBadgeInner: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#475569",
    textAlign: "center",
    marginBottom: 10,
  },

  emptySubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
});
