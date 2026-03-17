import { BlurView } from "expo-blur";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import {
  MessageCircle,
  Send,
  Smile,
  Sparkles,
  Users,
} from "lucide-react-native";
import { useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { hs, ms, vs } from "../../ui/theme";

const { width } = Dimensions.get("window");

export function EmptyChat({ onStartChat, isTrainer = false }) {
  const floatAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);
  const rotateAnim = useSharedValue(0);

  useEffect(() => {
    // Animation de flottement fluide
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    // Pulsation du point de statut
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );

    // Rotation subtile de l'icône
    rotateAnim.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnim.value, [0, 1], [0, -15]) },
      { rotate: `${interpolate(floatAnim.value, [0, 1], [-3, 3])}deg` },
    ],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: interpolate(pulseAnim.value, [1, 1.4], [1, 0.4]),
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeInDown.delay(200).duration(1000).springify()}
        style={[styles.content, iconStyle]}
      >
        {/* Halo de lumière en arrière-plan */}
        <View style={styles.glowContainer} pointerEvents="none">
          <ExpoLinearGradient
            colors={[
              "rgba(59, 130, 246, 0.15)",
              "rgba(139, 92, 246, 0.05)",
              "transparent",
            ]}
            style={styles.glow}
          />
        </View>

        {/* Illustration SVG centrale */}
        <View style={styles.iconWrapper}>
          <BlurView intensity={30} tint="light" style={styles.iconBlur}>
            <Svg width={160} height={160} viewBox="0 0 120 120">
              <Defs>
                <RadialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </RadialGradient>
                <LinearGradient
                  id="mainGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor="#60A5FA" />
                  <Stop offset="100%" stopColor="#2563EB" />
                </LinearGradient>
              </Defs>

              <Circle cx="60" cy="60" r="50" fill="url(#bgGlow)" />
              <Path
                d="M40 35h40c5.5 0 10 4.5 10 10v25c0 5.5-4.5 10-10 10H52l-12 12V80c-5.5 0-10-4.5-10-10V45c0-5.5 4.5-10 10-10z"
                fill="url(#mainGrad)"
                shadowColor="#000"
                shadowOpacity={0.2}
              />
              <Rect
                x="48"
                y="50"
                width="24"
                height="4"
                rx="2"
                fill="white"
                fillOpacity="0.9"
              />
              <Rect
                x="48"
                y="60"
                width="16"
                height="4"
                rx="2"
                fill="white"
                fillOpacity="0.6"
              />
            </Svg>
          </BlurView>

          {/* Point de statut "En ligne" animé */}
          <View style={styles.statusAnchor}>
            <Animated.View style={[styles.dotPulse, dotStyle]} />
            <View style={styles.accentDot} />
          </View>

          {!isTrainer && (
            <Animated.View entering={FadeIn.delay(800)} style={styles.newBadge}>
              <BlurView intensity={80} tint="light" style={styles.newBadgeBlur}>
                <Sparkles size={12} color="#F59E0B" />
                <Text style={styles.newBadgeText}>Communauté active</Text>
              </BlurView>
            </Animated.View>
          )}
        </View>

        {/* Textes */}
        <View style={styles.textStack}>
          <Text style={styles.title}>
            {isTrainer ? "Lancez le live !" : "C'est un peu calme..."}
          </Text>
          <Text style={styles.subtitle}>
            {isTrainer
              ? "Commencez par envoyer un message de bienvenue pour encourager vos apprenants."
              : "Posez votre première question ou partagez une réflexion avec le groupe."}
          </Text>
        </View>

        {/* Grille de suggestions */}
        <View style={styles.suggestionsContainer}>
          <SuggestionItem
            icon={<MessageCircle size={16} color="#3B82F6" />}
            label="Question"
          />
          <View style={styles.suggestionDivider} />
          <SuggestionItem
            icon={<Users size={16} color="#8B5CF6" />}
            label="Échange"
          />
          <View style={styles.suggestionDivider} />
          <SuggestionItem
            icon={<Smile size={16} color="#10B981" />}
            label="Idées"
          />
        </View>

        {/* Bouton Principal */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={onStartChat}
          activeOpacity={0.8}
        >
          <ExpoLinearGradient
            colors={["#3B82F6", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Send size={20} color="white" />
            <Text style={styles.buttonText}>Démarrer la discussion</Text>
          </ExpoLinearGradient>
        </TouchableOpacity>

        <View style={styles.tipContainer}>
          <Text style={styles.tipDescription}>
            💡 Les messages sont visibles par tous les participants.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

// Sous-composant pour plus de clarté
const SuggestionItem = ({ icon, label }) => (
  <View style={styles.suggestionItem}>
    <View style={styles.suggestionIcon}>{icon}</View>
    <Text style={styles.suggestionText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  content: { alignItems: "center", paddingHorizontal: ms(40) },

  glowContainer: {
    position: "absolute",
    width: hs(300),
    height: vs(300),
    top: vs(-50),
    opacity: 0.6,
  },
  glow: { flex: 1, borderRadius: ms(150) },

  iconWrapper: { marginBottom: vs(40), position: "relative" },
  iconBlur: {
    borderRadius: ms(80),
    padding: ms(10),
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  statusAnchor: {
    position: "absolute",
    bottom: vs(25),
    right: hs(25),
    width: hs(20),
    height: vs(20),
    justifyContent: "center",
    alignItems: "center",
  },

  accentDot: {
    width: hs(14),
    height: vs(14),
    borderRadius: ms(7),
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFF",
  },

  dotPulse: {
    position: "absolute",
    width: hs(30),
    height: vs(30),
    borderRadius: ms(15),
    backgroundColor: "#10B981",
  },

  newBadge: {
    position: "absolute",
    top: 0,
    right: hs(-20),
    borderRadius: ms(20),
    overflow: "hidden",
    elevation: 4,
  },

  newBadgeBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ms(12),
    paddingVertical: vs(6),
    gap: ms(6),
    backgroundColor: "rgba(255,255,255,0.7)",
  },

  newBadgeText: { fontSize: ms(11), fontWeight: "700", color: "#B45309" },

  textStack: { alignItems: "center", marginBottom: vs(32) },

  title: {
    fontSize: ms(26),
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: vs(12),
  },

  subtitle: {
    fontSize: ms(15),
    color: "#64748B",
    textAlign: "center",
    lineHeight: vs(22),
  },

  suggestionsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: ms(24),
    padding: ms(16),
    marginBottom: vs(32),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },

  suggestionItem: { flex: 1, alignItems: "center", gap: ms(8) },

  suggestionIcon: {
    width: hs(36),
    height: vs(36),
    borderRadius: ms(12),
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  suggestionText: { fontSize: ms(12), fontWeight: "600", color: "#475569" },

  suggestionDivider: {
    width: 1,
    height: vs(30),
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
  },

  startButton: {
    width: "100%",
    borderRadius: ms(30),
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#3B82F6",
    shadowRadius: ms(15),
    shadowOpacity: 0.2,
  },

  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: vs(18),
    gap: ms(12),
  },

  buttonText: { fontSize: ms(16), fontWeight: "700", color: "#FFF" },

  tipContainer: { marginTop: vs(24) },
  tipDescription: { fontSize: ms(12), color: "#94A3B8", fontStyle: "italic" },
});
