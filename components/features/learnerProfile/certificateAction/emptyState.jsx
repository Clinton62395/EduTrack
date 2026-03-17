import { Award } from "lucide-react-native";
import { Platform, StyleSheet, Text, View } from "react-native";
import { hs, ms, vs } from "../../../ui/theme";

export function EmptyState({
  title = "Aucune formation",
  subtitle = "Vous n'êtes inscrit à aucune formation pour le moment.",
}) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyBadgeOuter}>
        <View style={styles.emptyBadgeInner}>
          <Award size={40} color="#94A3B8" />
        </View>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    paddingTop: vs(40),
    paddingHorizontal: ms(24),
  },

  emptyBadgeOuter: {
    width: hs(120),
    height: vs(120),
    borderRadius: ms(60),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: vs(24),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: ms(18),
        shadowOffset: { width: 0, height: vs(6) },
      },
      android: { elevation: ms(5) },
    }),
  },

  emptyBadgeInner: {
    width: hs(85),
    height: vs(85),
    borderRadius: ms(42.5),
    borderWidth: 2, // ⚠️ garder fixe
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: ms(22),
    fontWeight: "800",
    color: "#475569",
    textAlign: "center",
    marginBottom: vs(10),
  },

  emptySubtitle: {
    fontSize: ms(15),
    color: "#64748B",
    textAlign: "center",
    lineHeight: vs(22),
  },
});
