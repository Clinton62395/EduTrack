import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronRight,
  GripVertical,
  Pin,
  Sparkles,
  Star,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInUp,
  runOnJS,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export function PinnedBanner({ messages, onPress, onDismiss }) {
  const [isVisible, setIsVisible] = useState(true);
  const rotateAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const translateY = useSharedValue(0);

  const firstMessage = messages[0];
  const hasMultiple = messages.length > 1;

  useEffect(() => {
    // Animation de pulsation subtile pour attirer l'attention
    rotateAnim.value = withRepeat(
      withSequence(
        withSpring(-5, { damping: 2, stiffness: 100 }),
        withSpring(5, { damping: 2, stiffness: 100 }),
        withSpring(0, { damping: 2, stiffness: 100 }),
      ),
      1, // Une seule fois
      false,
    );

    // Animation de scale au montage
    scaleAnim.value = withSequence(
      withSpring(1.05, { damping: 3 }),
      withSpring(1, { damping: 3 }),
    );
  }, []);

  const pinStyle = useAnimatedStyle(() => {
    // On s'assure que la valeur est convertie en string de manière propre
    const rotation = rotateAnim.value.toString();
    return {
      transform: [{ rotate: `${rotation}deg` }, { scale: scaleAnim.value }],
    };
  });

  const handleDismiss = () => {
    translateY.value = withSpring(-100, { damping: 15 }, () => {
      if (onDismiss) {
        runOnJS(onDismiss)();
      }
    });
    setIsVisible(false);
  };

  const wrapperAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!messages || messages.length === 0) return null;

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={SlideInDown.duration(500).springify()}
      exiting={FadeInUp.duration(300)}
      style={[styles.wrapper, wrapperAnimatedStyle]}
    >
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <LinearGradient
          colors={["rgba(245, 158, 11, 0.1)", "rgba(245, 158, 11, 0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />

        <TouchableOpacity
          style={styles.container}
          onPress={onPress}
          activeOpacity={0.9}
          onLongPress={handleDismiss}
        >
          {/* Barre latérale dorée avec animation */}
          <LinearGradient
            colors={["#F59E0B", "#FBBF24"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.accentBar}
          />

          {/* Poignée de glissement (optionnelle) */}
          <View style={styles.dragHandle}>
            <GripVertical size={12} color="#F59E0B" opacity={0.5} />
          </View>

          <View style={styles.content}>
            {/* Icône avec animation */}
            <Animated.View style={[styles.iconContainer, pinStyle]}>
              <LinearGradient
                colors={["#F59E0B", "#FBBF24"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Pin size={16} color="#FFFFFF" strokeWidth={3} />
              </LinearGradient>

              {/* Effet de sparkle pour les messages multiples */}
              {hasMultiple && (
                <View style={styles.sparkleContainer}>
                  <Sparkles size={8} color="#F59E0B" />
                </View>
              )}
            </Animated.View>

            <View style={styles.textContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>
                  {hasMultiple ? "MULTIPLES ÉPINGLÉS" : "MESSAGE ÉPINGLÉ"}
                </Text>

                {/* Badge "Important" */}
                <View style={styles.importantBadge}>
                  <Star size={8} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.importantText}>Important</Text>
                </View>
              </View>

              <Text style={styles.messagePreview} numberOfLines={1}>
                <Text style={styles.senderName}>{firstMessage.senderName}</Text>
                <Text style={styles.messageText}> • {firstMessage.text}</Text>
              </Text>

              {/* Aperçu des autres messages si multiples */}
              {hasMultiple && (
                <View style={styles.moreMessages}>
                  {messages.slice(1, 3).map((msg, index) => (
                    <Text
                      key={index}
                      style={styles.moreMessagePreview}
                      numberOfLines={1}
                    >
                      <Text style={styles.moreSender}>{msg.senderName}: </Text>
                      {msg.text}
                    </Text>
                  ))}
                  {messages.length > 3 && (
                    <Text style={styles.andMore}>
                      et {messages.length - 3} autre(s)...
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Section droite avec indicateur de quantité */}
            <View style={styles.rightContent}>
              {messages.length > 1 && (
                <View style={styles.badge}>
                  <LinearGradient
                    colors={["#F59E0B", "#FBBF24"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.badgeGradient}
                  >
                    <Text style={styles.badgeText}>+{messages.length - 1}</Text>
                  </LinearGradient>
                </View>
              )}

              <View style={styles.arrowContainer}>
                <ChevronRight size={18} color="#F59E0B" />
              </View>
            </View>
          </View>

          {/* Indicateur de swipe pour fermer */}
          <View style={styles.swipeHint}>
            <View style={styles.swipeHintDot} />
            <View style={[styles.swipeHintDot, styles.swipeHintDotMiddle]} />
            <View style={styles.swipeHintDot} />
          </View>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: 16,
    position: "absolute",
    top: 0,
    zIndex: 10,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    position: "relative",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  dragHandle: {
    position: "absolute",
    left: 12,
    top: "50%",
    marginTop: -6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 28, // Espace pour la poignée
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 14,
    position: "relative",
  },
  iconGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sparkleContainer: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  textContainer: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: 1,
  },
  importantBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  importantText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#F59E0B",
  },
  messagePreview: {
    fontSize: 14,
    color: "#1E293B",
    marginBottom: 4,
  },
  senderName: {
    fontWeight: "800",
    color: "#0F172A",
  },
  messageText: {
    fontWeight: "400",
    color: "#475569",
  },
  moreMessages: {
    gap: 2,
  },
  moreMessagePreview: {
    fontSize: 12,
    color: "#64748B",
  },
  moreSender: {
    fontWeight: "600",
    color: "#475569",
  },
  andMore: {
    fontSize: 11,
    color: "#94A3B8",
    fontStyle: "italic",
    marginTop: 2,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingLeft: 12,
  },
  badge: {
    overflow: "hidden",
    borderRadius: 10,
  },
  badgeGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  swipeHint: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingBottom: 6,
  },
  swipeHintDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F59E0B",
    opacity: 0.3,
  },
  swipeHintDotMiddle: {
    width: 8,
    opacity: 0.5,
  },
});
