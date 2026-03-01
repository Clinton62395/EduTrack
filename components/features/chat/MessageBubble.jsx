import { Text } from "@/components/ui/theme";
import { BlurView } from "expo-blur";
import { Check, CheckCheck, Crown, Reply, Sparkles } from "lucide-react-native";
import { useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  interpolate,
  runOnJS,
  SlideInLeft,
  SlideInRight,
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
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const { width } = Dimensions.get("window");

/**
 * ═══════════════════════════════════════════════════════
 * 💬 MessageBubble — Premium Glassmorphisme V2
 * ═══════════════════════════════════════════════════════
 *
 * Bulle de message ultra-moderne avec :
 * - Effet glassmorphique avancé
 * - Animations fluides
 * - Indicateurs de statut (envoyé, lu)
 * - Réactions rapides
 * - Effet de profondeur 3D
 */
// ... (tes imports restent identiques)

export function MessageBubble({
  message,
  isOwn,
  isTrainer,
  showAvatar,
  onLongPress,
  onReply,
  onReact,
  status = "sent",
}) {
  const [showReactions, setShowReactions] = useState(false);
  const scaleAnim = useSharedValue(1);

  // 1. GESTION DES ACTIONS
  const handleLongPress = () => {
    scaleAnim.value = withSequence(
      withTiming(1.05, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    );
    setShowReactions(true); // Ouvre le menu d'emojis
    if (onLongPress) runOnJS(onLongPress)();
  };

  const handleSelectEmoji = (emoji) => {
    setShowReactions(false); // Ferme le menu immédiatement
    if (onReact) onReact(emoji);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <Animated.View
      entering={isOwn ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
      style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}
    >
      {/* Avatar gauche */}
      {!isOwn && (
        <View style={styles.avatarSlot}>
          {showAvatar ? (
            <PremiumAvatar
              name={message.senderName}
              photoURL={message.senderPhoto}
              isTrainer={message.senderRole === "trainer"}
              isOwn={false}
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
      )}

      <View style={styles.bubbleWrapper}>
        {/* Nom de l'expéditeur */}
        {!isOwn && showAvatar && (
          <View style={styles.senderRow}>
            <Text style={styles.senderName}>{message.senderName}</Text>
            {message.senderRole === "trainer" && (
              <View style={styles.trainerBadge}>
                <Crown size={10} color="#F59E0B" />
                <Text style={styles.trainerBadgeText}>Formateur</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          onLongPress={handleLongPress}
          activeOpacity={0.9}
          delayLongPress={300}
        >
          <Animated.View style={animatedStyle}>
            <BlurView
              intensity={isOwn ? 40 : 20} // Réduit pour meilleure lisibilité sur fond sombre
              tint={isOwn ? "light" : "dark"}
              style={[
                styles.bubble,
                isOwn ? styles.bubbleOwn : styles.bubbleOther,
                message.pinned && styles.bubblePinned,
              ]}
            >
              {/* Contenu de la bulle (Réponse, Texte, Heure) */}
              {message.replyTo && (
                <View style={styles.replyContainer}>
                  <View style={styles.replyLine} />
                  <View style={styles.replyContent}>
                    <Text style={styles.replyName}>
                      {message.replyTo.senderName}
                    </Text>
                    <Text style={styles.replyText} numberOfLines={1}>
                      {message.replyTo.text}
                    </Text>
                  </View>
                </View>
              )}

              <Text
                style={[styles.messageText, isOwn && styles.messageTextOwn]}
              >
                {message.text}
              </Text>

              <View style={styles.messageFooter}>
                <Text style={styles.timeText}>
                  {message.createdAt ? "12:00" : "···"}
                </Text>
                {isOwn && (
                  <View style={styles.statusContainer}>
                    {status === "read" ? (
                      <CheckCheck size={12} color="#60A5FA" />
                    ) : (
                      <Check size={12} color="rgba(255,255,255,0.5)" />
                    )}
                  </View>
                )}
              </View>
            </BlurView>
          </Animated.View>

          {/* ── LES RÉACTIONS ATTACHÉES (Le badge en bas de bulle) ── */}
          {/* Réactions existantes groupées */}
          {message.reactions && message.reactions.length > 0 && (
            <View
              style={[
                styles.reactionsContainer,
                isOwn ? { right: 0 } : { left: 0 },
              ]}
            >
              {Object.entries(
                message.reactions.reduce((acc, curr) => {
                  acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                  return acc;
                }, {}),
              ).map(([emoji, count]) => (
                <View key={emoji} style={styles.reactionChip}>
                  <Text style={styles.reactionChipEmoji}>{emoji}</Text>
                  <Text style={styles.reactionChipCount}>{count}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* ── BARRE DE CHOIX D'EMOJI (S'affiche au LongPress) ── */}
        {showReactions && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[
              styles.reactionsBar,
              isOwn ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
            ]}
          >
            {["👍", "❤️", "😂", "😮"].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.reactionButton}
                onPress={() => handleSelectEmoji(emoji)}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.reactionDivider} />
            <TouchableOpacity
              style={styles.replyButton}
              onPress={() => {
                setShowReactions(false);
                onReply?.(message);
              }}
            >
              <Reply size={14} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Avatar droite */}
      {isOwn && (
        <View style={styles.avatarSlot}>
          {showAvatar ? (
            <PremiumAvatar
              name={message.senderName}
              photoURL={message.senderPhoto}
              isOwn={true}
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
      )}
    </Animated.View>
  );
}

/**
 * ── Avatar Premium avec animations et effets
 */
function PremiumAvatar({ name, photoURL, isTrainer, isOwn }) {
  const initial = name?.charAt(0).toUpperCase() || "?";
  const size = 38;
  const glowAnim = useSharedValue(0);

  // Animation de glow pour les trainers
  if (isTrainer) {
    glowAnim.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(glowAnim.value, [0, 0.5, 1], [0.3, 0.8, 0.3]),
      transform: [{ scale: 1 + glowAnim.value * 0.1 }],
    };
  });

  if (photoURL) {
    return (
      <View
        style={[
          styles.avatarContainer,
          isTrainer && styles.avatarTrainerBorder,
        ]}
      >
        {isTrainer && <Animated.View style={[styles.avatarGlow, glowStyle]} />}
        <Image
          source={{ uri: photoURL }}
          style={[styles.avatarImage, { width: size, height: size }]}
        />
        {isTrainer && (
          <View style={styles.trainerCrown}>
            <Crown size={12} color="#F59E0B" />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.avatarContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Dégradé premium */}
          <RadialGradient id="avatarGrad" cx="30%" cy="30%" r="70%">
            <Stop
              offset="0%"
              stopColor={isOwn ? "#60A5FA" : isTrainer ? "#C084FC" : "#94A3B8"}
            />
            <Stop
              offset="100%"
              stopColor={isOwn ? "#2563EB" : isTrainer ? "#7C3AED" : "#64748B"}
            />
          </RadialGradient>

          {/* Bague pour trainer */}
          {isTrainer && (
            <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#D97706" />
            </LinearGradient>
          )}
        </Defs>

        {/* Bague trainer */}
        {isTrainer && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 + 2}
            fill="url(#ringGrad)"
          />
        )}

        {/* Cercle principal */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={isTrainer ? size / 2 - 2 : size / 2}
          fill="url(#avatarGrad)"
        />

        {/* Initiale */}
        <SvgText
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="white"
        >
          {initial}
        </SvgText>
      </Svg>

      {/* Badge trainer */}
      {isTrainer && (
        <View style={styles.avatarTrainerBadge}>
          <Sparkles size={8} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout de base
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  rowOwn: {
    justifyContent: "flex-end",
  },
  rowOther: {
    justifyContent: "flex-start",
  },

  // Avatar
  avatarSlot: {
    width: 44,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 2,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
  },
  avatarContainer: {
    position: "relative",
    width: 38,
    height: 38,
  },
  avatarImage: {
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarGlow: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F59E0B",
    top: -4,
    left: -4,
  },
  avatarTrainerBorder: {
    borderWidth: 0,
  },
  trainerCrown: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 2,
  },
  avatarTrainerBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    padding: 2,
  },

  bubbleWrapper: {
    maxWidth: "75%",
    marginHorizontal: 4,
    position: "relative", // IMPORTANT pour le positionnement des badges
  },

  // En-tête
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    marginLeft: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.3,
  },
  trainerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245,158,11,0.15)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  trainerBadgeText: {
    fontSize: 9,
    color: "#F59E0B",
    fontWeight: "700",
  },

  // Bulles
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  bubbleOwn: {
    borderBottomRightRadius: 6,
    backgroundColor: "rgba(37, 99, 235, 0.8)",
  },
  bubbleOther: {
    borderBottomLeftRadius: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  bubblePinned: {
    borderColor: "#F59E0B",
    borderWidth: 1.5,
  },

  // Épinglé
  pinnedContainer: {
    marginBottom: 8,
  },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245,158,11,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  pinnedText: {
    fontSize: 9,
    color: "#F59E0B",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  // Reply
  replyContainer: {
    flexDirection: "row",
    marginBottom: 8,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    padding: 8,
  },
  replyLine: {
    width: 3,
    backgroundColor: "#3B82F6",
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    fontSize: 10,
    fontWeight: "700",
    color: "#60A5FA",
    marginBottom: 2,
  },
  replyText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },

  // Texte
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "400",
  },
  messageTextOwn: {
    color: "white",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
  },
  timeTextOwn: {
    color: "rgba(255,255,255,0.6)",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Shine effect
  shine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.1)",
    transform: [{ skewY: "-10deg" }],
  },

  // Reactions bar
  reactionsBar: {
    flexDirection: "row",
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderRadius: 30,
    padding: 4,
    marginTop: 4,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  reactionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 2,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 4,
  },
  replyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  // Reactions existantes

  reactionsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: -10, // Fait chevaucher la bulle
    zIndex: 10,
    gap: 2,
  },
  reactionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  reactionChipEmoji: {
    fontSize: 12,
  },
  reactionChipCount: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
});
