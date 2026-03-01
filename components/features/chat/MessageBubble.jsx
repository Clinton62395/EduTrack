import { formatMessageTime } from "@/components/helpers/timeFormatter";
import { Text } from "@/components/ui/theme";
import { useImageZoom } from "@/hooks/chatHooks/useImageZoom";
import { BlurView } from "expo-blur";
import { Image as ExpoImage } from "expo-image";
import { Check, CheckCheck, Crown, FileText, Reply } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeOut,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { ImageZoomModal } from "./ImageZoomModal";
import { AudioPlayer } from "./audioPlayer";
import { PremiumAvatar } from "./avatarPrimuim";
import events from "./events";

const COLORS = {
  bg: "#080C14",
  ownBubble: "rgba(14, 165, 233, 0.18)",
  ownBorder: "rgba(14, 165, 233, 0.45)",
  ownAccent: "#0EA5E9",
  otherBubble: "rgba(255, 255, 255, 0.06)",
  otherBorder: "rgba(255, 255, 255, 0.10)",
  text: "rgba(255,255,255,0.92)",
  textMuted: "rgba(255,255,255,0.38)",
  textOwn: "#ffffff",
  pinned: "#F59E0B",
  trainer: "#A78BFA",
  reactionBg: "rgba(15, 23, 42, 0.95)",
  replyBg: "rgba(0,0,0,0.25)",
};

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  onLongPress,
  onReply,
  onReact,
  status = "sent",
}) {
  const [showReactions, setShowReactions] = useState(false);
  const scale = useSharedValue(1);
  const reactionBarY = useSharedValue(6);
  const reactionBarOpacity = useSharedValue(0);
  const { openZoom, closeZoom, zoomedImage } = useImageZoom();

  // ── Handlers ──
  const handleLongPress = () => {
    scale.value = withSequence(
      withTiming(0.96, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
    reactionBarOpacity.value = withTiming(1, { duration: 180 });
    reactionBarY.value = withSpring(0, { damping: 14, stiffness: 180 });
    setShowReactions(true);
    if (onLongPress) onLongPress(); // Retrait du runOnJS ici
  };

  const handleSelectEmoji = (emoji) => {
    setShowReactions(false);
    if (onReact) onReact(emoji);
  };

  useEffect(() => {
    const off = events.on("chat:dismissAll", () => setShowReactions(false));
    return () => off(); // Crucial : on retourne le nettoyage
  }, []);

  const handleImagePress = useCallback(() => {
    if (message.attachment?.url && message.attachment?.type === "image") {
      openZoom(message.attachment.url, "message");
    }
  }, [message.attachment, openZoom]);

  // ── Animations ──
  const bubbleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const reactionBarStyle = useAnimatedStyle(() => ({
    opacity: reactionBarOpacity.value,
    transform: [{ translateY: reactionBarY.value }],
  }));

  const groupedReactions = useMemo(() => {
    return (message.reactions || []).reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});
  }, [message.reactions]);

  const hasReactions = Object.keys(groupedReactions).length > 0;

  return (
    <>
      <ImageZoomModal
        visible={!!zoomedImage}
        imageUri={zoomedImage?.uri}
        onClose={closeZoom}
      />

      <Animated.View
        entering={isOwn ? SlideInRight.springify() : SlideInLeft.springify()}
        style={[
          styles.row,
          isOwn ? styles.rowOwn : styles.rowOther,
          hasReactions && styles.rowWithReactions,
        ]}
      >
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

        <View style={[styles.bubbleWrapper, isOwn && styles.bubbleWrapperOwn]}>
          {!isOwn && showAvatar && (
            <View style={styles.senderRow}>
              <Text style={styles.senderName}>{message.senderName}</Text>
              {message.senderRole === "trainer" && (
                <View style={styles.trainerBadge}>
                  <Crown size={9} color={COLORS.trainer} />
                  <Text style={styles.trainerBadgeText}>Formateur</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            onLongPress={handleLongPress}
            activeOpacity={0.92}
            delayLongPress={280}
          >
            <Animated.View style={bubbleAnimStyle}>
              <BlurView
                intensity={isOwn ? 60 : 30}
                tint="dark"
                style={[
                  styles.bubble,
                  isOwn ? styles.bubbleOwn : styles.bubbleOther,
                  message.pinned && styles.bubblePinned,
                  message.attachment?.type === "image" &&
                    !message.text &&
                    styles.bubbleImageOnly,
                ]}
              >
                {isOwn && <View style={styles.bubbleShine} />}

                {message.pinned && (
                  <View style={styles.pinnedBadge}>
                    <Text style={styles.pinnedText}>📌 Épinglé</Text>
                  </View>
                )}

                {message.replyTo && (
                  <View style={styles.replyContainer}>
                    <View style={styles.replyAccentLine} />
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

                {/* --- MEDIA RENDERING --- */}
                {message.attachment?.type === "image" && (
                  <TouchableOpacity
                    onPress={handleImagePress}
                    activeOpacity={0.9}
                    style={styles.imageWrapper}
                  >
                    <ExpoImage
                      source={{ uri: message.attachment.url }}
                      style={styles.attachmentImage}
                      contentFit="cover"
                      transition={300}
                    />
                    <View style={styles.imageOverlay} />
                  </TouchableOpacity>
                )}

                {(message.attachment?.type === "file" ||
                  message.attachment?.type === "document") && (
                  <TouchableOpacity
                    style={styles.docCard}
                    onPress={() => Linking.openURL(message.attachment.url)}
                  >
                    <View style={styles.docIconBg}>
                      <FileText size={22} color="#0EA5E9" />
                    </View>
                    <View style={styles.docMeta}>
                      <Text style={styles.docTitle} numberOfLines={1}>
                        {message.attachment.name || "Document"}
                      </Text>
                      <Text style={styles.docSubtitle}>
                        Appuyer pour ouvrir
                      </Text>
                    </View>
                    <View style={styles.docArrow}>
                      <Text style={styles.docArrowText}>›</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {message.attachment?.type === "audio" && (
                  <AudioPlayer uri={message.attachment.url} isOwn={isOwn} />
                )}

                {!!message.text && (
                  <Text
                    style={[
                      styles.messageText,
                      isOwn && styles.messageTextOwn,
                      !!message.attachment && styles.messageTextWithAttachment,
                    ]}
                  >
                    {message.text}
                  </Text>
                )}

                <View style={styles.footer}>
                  <Text style={[styles.time, isOwn && styles.timeOwn]}>
                    {formatMessageTime(message.createdAt)}
                  </Text>
                  {isOwn && (
                    <View style={styles.statusDot}>
                      {status === "read" ? (
                        <CheckCheck size={11} color="#0EA5E9" />
                      ) : (
                        <Check size={11} color="rgba(255,255,255,0.4)" />
                      )}
                    </View>
                  )}
                </View>
              </BlurView>
            </Animated.View>

            {/* --- REACTIONS BADGE --- */}
            {hasReactions && (
              <View
                style={[
                  styles.reactionsRow,
                  isOwn ? styles.reactionsRowOwn : styles.reactionsRowOther,
                ]}
              >
                {Object.entries(groupedReactions).map(([emoji, count]) => (
                  <TouchableOpacity
                    key={emoji}
                    style={styles.reactionChip}
                    onPress={() => onReact?.(emoji)}
                  >
                    <Text style={styles.reactionChipEmoji}>{emoji}</Text>
                    {count > 1 && (
                      <Text style={styles.reactionChipCount}>{count}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </TouchableOpacity>

          {/* --- LONG PRESS MENU --- */}
          {showReactions && (
            <Animated.View
              exiting={FadeOut.duration(150)}
              style={[
                styles.emojiBar,
                isOwn ? styles.emojiBarOwn : styles.emojiBarOther,
                reactionBarStyle,
              ]}
            >
              {["👍", "❤️", "😂", "😮", "🔥", "🙏"].map((emoji, i) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiBtn}
                  onPress={() => handleSelectEmoji(emoji)}
                >
                  <Text style={styles.emojiBtnText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.emojiDivider} />
              <TouchableOpacity
                style={styles.replyBtn}
                onPress={() => {
                  setShowReactions(false);
                  onReply?.(message);
                  events.emit("chat:dismissAll");
                }}
              >
                <Reply size={13} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

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
    </>
  );
}
const styles = StyleSheet.create({
  // ── Layout ──
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  rowOwn: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },
  rowWithReactions: { marginBottom: 20 }, // Espace pour les réactions flottantes

  // ── Avatar ──
  avatarSlot: {
    width: 40,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 2,
  },
  avatarPlaceholder: { width: 36, height: 36 },

  // ── Wrapper bulle ──
  bubbleWrapper: {
    maxWidth: "74%",
    marginHorizontal: 4,
  },
  bubbleWrapperOwn: { alignItems: "flex-end" },

  // ── Sender ──
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    marginLeft: 6,
  },
  senderName: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.4,
  },
  trainerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(167,139,250,0.12)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trainerBadgeText: {
    fontSize: 9,
    color: COLORS.trainer,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Bulle ──
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    // Ombre douce
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  bubbleOwn: {
    borderBottomRightRadius: 4, // Coin signature
    backgroundColor: COLORS.ownBubble,
    borderColor: COLORS.ownBorder,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4, // Coin signature
    backgroundColor: COLORS.otherBubble,
    borderColor: COLORS.otherBorder,
  },
  bubblePinned: {
    borderColor: "rgba(245,158,11,0.55)",
    borderWidth: 1.5,
  },
  bubbleImageOnly: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    paddingBottom: 8,
  },

  // Ligne lumineuse en haut de la bulle own
  bubbleShine: {
    position: "absolute",
    top: 0,
    left: "15%",
    right: "15%",
    height: 1,
    backgroundColor: "rgba(14,165,233,0.6)",
    borderRadius: 1,
  },

  // ── Épinglé ──
  pinnedBadge: {
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  pinnedText: {
    fontSize: 10,
    color: COLORS.pinned,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Réponse ──
  replyContainer: {
    flexDirection: "row",
    marginBottom: 8,
    backgroundColor: COLORS.replyBg,
    borderRadius: 10,
    padding: 8,
    overflow: "hidden",
  },
  replyAccentLine: {
    width: 2.5,
    backgroundColor: COLORS.ownAccent,
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: { flex: 1 },
  replyName: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.ownAccent,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  replyText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },

  // ── Image ──
  imageWrapper: {
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  attachmentImage: {
    width: 220,
    height: 180,
    borderRadius: 14,
  },
  // Léger vignettage sur l'image
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.04)",
  },

  // ── Document ──
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    width: 220,
    backgroundColor: "rgba(14,165,233,0.08)",
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.22)",
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  docIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(14,165,233,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  docMeta: { flex: 1 },
  docTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  docSubtitle: {
    fontSize: 10,
    color: "rgba(14,165,233,0.7)",
  },
  docArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(14,165,233,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  docArrowText: {
    fontSize: 18,
    color: COLORS.ownAccent,
    marginTop: -2,
  },

  // ── Texte ──
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
    fontWeight: "400",
    letterSpacing: 0.1,
  },
  messageTextOwn: {
    color: COLORS.textOwn,
  },
  messageTextWithAttachment: { marginTop: 8 },

  // ── Footer ──
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 5,
    gap: 5,
  },
  time: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.2,
  },
  timeOwn: {
    color: "rgba(255,255,255,0.5)",
  },
  statusDot: { flexDirection: "row", alignItems: "center" },

  // ── Réactions existantes (badge flottant) ──
  reactionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    position: "absolute",
    bottom: -14,
  },
  reactionsRowOwn: { right: 8 },
  reactionsRowOther: { left: 8 },
  reactionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.reactionBg,
    borderRadius: 14,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    // Ombre
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  reactionChipEmoji: { fontSize: 13 },
  reactionChipCount: {
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "700",
  },

  // ── Barre emoji (long press) ──
  emojiBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.reactionBg,
    borderRadius: 28,
    paddingHorizontal: 6,
    paddingVertical: 5,
    marginTop: 6,
    gap: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    // Ombre portée
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  emojiBarOwn: { alignSelf: "flex-end" },
  emojiBarOther: { alignSelf: "flex-start" },
  emojiBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  emojiBtnText: { fontSize: 18 },
  emojiDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 3,
  },
  replyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
