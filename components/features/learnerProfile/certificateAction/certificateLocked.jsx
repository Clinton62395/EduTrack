import { CheckCircle2, Clock, Lock } from "lucide-react-native";
import { Platform, StyleSheet, Text, View } from "react-native";

export function CertificateLocked() {
  return (
    <View style={styles.container}>
      {/* BADGE */}
      <View style={styles.badgeWrapper}>
        <View style={styles.badgeOuter}>
          <View style={styles.badgeInner}>
            <Lock size={42} color="#94A3B8" />
          </View>
        </View>
      </View>

      {/* TEXT */}
      <Text style={styles.title}>Certificat verrouillé</Text>
      <Text style={styles.subtitle}>
        Terminez toutes les leçons et réussissez tous les quiz pour débloquer
        votre certificat.
      </Text>

      {/* CHECKLIST */}
      <View style={styles.card}>
        <ChecklistItem label="Toutes les leçons complétées" done={false} />
        <View style={styles.divider} />
        <ChecklistItem label="Tous les quiz réussis (≥ 70%)" done={false} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// CHECKLIST ITEM
// ─────────────────────────────────────────

function ChecklistItem({ label, done }) {
  return (
    <View style={styles.item}>
      <View
        style={[styles.iconBox, done ? styles.iconDone : styles.iconPending]}
      >
        {done ? (
          <CheckCircle2 size={18} color="#10B981" />
        ) : (
          <Clock size={18} color="#F59E0B" />
        )}
      </View>

      <Text style={[styles.label, done && styles.labelDone]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 20,
  },

  // BADGE
  badgeWrapper: {
    marginBottom: 28,
  },

  badgeOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 6 },
    }),
  },

  badgeInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  // TEXT
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#475569",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },

  // CARD
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 4 },
    }),
  },

  // ITEM
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  iconDone: {
    backgroundColor: "#DCFCE7",
  },

  iconPending: {
    backgroundColor: "#FEF3C7",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },

  labelDone: {
    color: "#10B981",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 70,
  },
});
