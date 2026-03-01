import { Search, ShieldCheck } from "lucide-react-native";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

export function CheckingState() {
  const pulse = useSharedValue(1);

  // Animation de pulsation pour l'icône
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1, // Infini
      true,
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: withTiming(pulse.value === 1 ? 0.8 : 1),
  }));

  return (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.container}>
      {/* Conteneur d'icône avec effet de halo */}
      <View style={styles.outerCircle}>
        <Animated.View style={[styles.iconBox, animatedIconStyle]}>
          <Search size={32} color="#2563EB" strokeWidth={2.5} />
          <View style={styles.absLoader}>
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        </Animated.View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Analyse de réussite</Text>

        <View style={styles.badgeContainer}>
          <ShieldCheck size={14} color="#10B981" />
          <Text style={styles.badgeText}>SÉCURISÉ</Text>
        </View>

        <Text style={styles.sub}>
          Nous vérifions vos scores aux quiz et la complétion des leçons pour
          générer votre certificat officiel.
        </Text>
      </View>

      {/* Barre de progression indéterminée "stylisée" */}
      <View style={styles.progressBarBg}>
        <Animated.View style={styles.progressBarFill} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  outerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  absLoader: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    elevation: 2,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 15,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10B981",
    letterSpacing: 1,
  },
  sub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  progressBarBg: {
    width: 140,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    marginTop: 40,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "40%",
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 2,
    // Note: Pour une vraie barre de progression animée,
    // on pourrait aussi utiliser Reanimated ici.
  },
});
