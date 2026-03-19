import { BlurView } from "expo-blur";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { ChevronLeft, MoreVertical, Users } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { hs, ms, vs } from "../../ui/theme";

// Ajout d'une valeur par défaut pour insets pour éviter le crash
export function ChatHeader({
  title,
  messageCount = 0,
  onBack,
  insets = { top: 0 }, // Valeur de repli (fallback)
  learners = 0,
}) {
  const pulseValue = useSharedValue(1);

  useEffect(() => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: 1.3 - pulseValue.value, // Effet d'évanouissement en pulsant
  }));

  return (
    // On utilise insets.top pour rester dans la zone de sécurité (safe-area)
    <View style={[styles.headerWrapper, { paddingTop: insets?.top ?? 0 }]}>
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        <View style={styles.glassContainer}>
          {/* Bouton Retour */}
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <ChevronLeft size={24} color="#1E293B" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          {/* Centre : Titre & Statut */}
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title || "Formation"}
            </Text>
            <View style={styles.statusRow}>
              <View style={styles.liveIndicator}>
                <View style={styles.pulseContainer}>
                  <Animated.View style={[styles.pulseRing, pulseStyle]} />
                  <View style={styles.onlineDot} />
                </View>
                <Text style={styles.liveText}>DIRECT</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.countContainer}>
                <Users size={12} color="#6366F1" />
                <Text style={styles.countText}>{learners}</Text>
              </View>
            </View>
          </View>

          {/* Actions Droite */}
          <View style={styles.headerRight}>
            {messageCount > 0 && (
              <View style={styles.messageBadge}>
                <ExpoLinearGradient
                  colors={["#3B82F6", "#8B5CF6"]}
                  style={styles.badgeGradient}
                >
                  <Text style={styles.badgeText}>{messageCount}</Text>
                </ExpoLinearGradient>
              </View>
            )}

            <TouchableOpacity style={styles.menuButton}>
              <MoreVertical size={20} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    width: "100%",
    paddingHorizontal: ms(12),
    paddingBottom: vs(8),
  },

  blurContainer: {
    borderRadius: ms(24),
    overflow: "hidden",
    borderWidth: 1, // ⚠️ fixe
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },

  glassContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: vs(10),
    paddingHorizontal: ms(12),
  },

  backButton: {
    width: hs(40),
    height: vs(40),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: ms(12),
  },

  headerCenter: {
    flex: 1,
    paddingLeft: ms(12),
  },

  headerTitle: {
    fontSize: ms(16),
    fontWeight: "800",
    color: "#0F172A",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: vs(2),
  },

  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: ms(6),
    paddingVertical: vs(2),
    borderRadius: ms(10),
  },

  pulseContainer: {
    width: hs(10),
    height: vs(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: ms(4),
  },

  pulseRing: {
    position: "absolute",
    width: hs(14),
    height: vs(14),
    borderRadius: ms(7),
    backgroundColor: "#EF4444",
  },

  onlineDot: {
    width: hs(6),
    height: vs(6),
    borderRadius: ms(3),
    backgroundColor: "#EF4444",
  },

  liveText: {
    fontSize: ms(9),
    fontWeight: "900",
    color: "#EF4444",
  },

  divider: {
    width: 1, // ⚠️ fixe
    height: vs(10),
    backgroundColor: "rgba(0,0,0,0.1)",
    marginHorizontal: ms(8),
  },

  countContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    paddingHorizontal: ms(6),
    paddingVertical: vs(2),
    borderRadius: ms(10),
  },

  countText: {
    fontSize: ms(10),
    fontWeight: "700",
    color: "#6366F1",
    marginLeft: ms(3),
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(8),
  },

  messageBadge: {
    borderRadius: ms(10),
    overflow: "hidden",
  },

  badgeGradient: {
    paddingHorizontal: ms(8),
    paddingVertical: vs(2),
  },

  badgeText: {
    fontSize: ms(11),
    fontWeight: "900",
    color: "#FFFFFF",
  },

  menuButton: {
    width: hs(36),
    height: vs(36),
    justifyContent: "center",
    alignItems: "center",
  },
});
