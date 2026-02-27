import { BookOpen, CheckCircle2 } from "lucide-react-native";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function TrainingSelector({ trainings, selected, onSelect }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerDot} />
        <Text style={styles.headerLabel}>Sélectionnez une formation</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {trainings.map((t) => {
          const isActive = selected?.id === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => onSelect(t)}
              activeOpacity={0.75}
              style={[styles.card, isActive && styles.cardActive]}
            >
              {/* Icône */}
              <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                <BookOpen size={16} color={isActive ? "white" : "#64748B"} />
              </View>

              {/* Titre */}
              <Text
                style={[styles.cardTitle, isActive && styles.cardTitleActive]}
                numberOfLines={2}
              >
                {t.title}
              </Text>

              {/* Badge actif */}
              {isActive && (
                <View style={styles.activeBadge}>
                  <CheckCircle2 size={12} color="#2563EB" />
                  <Text style={styles.activeBadgeText}>Sélectionnée</Text>
                </View>
              )}

              {/* Barre de progression colorée en bas */}
              {isActive && <View style={styles.activeBar} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: "#F8FAFC",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2563EB",
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 4,
  },

  card: {
    width: 160,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  cardActive: {
    borderColor: "#2563EB",
    backgroundColor: "#FAFCFF",
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 5 },
    }),
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  iconBoxActive: {
    backgroundColor: "#2563EB",
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    lineHeight: 18,
    marginBottom: 8,
  },
  cardTitleActive: {
    color: "#1E40AF",
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
  },

  activeBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#2563EB",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});