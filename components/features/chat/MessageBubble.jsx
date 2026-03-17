import { formatMessageTime } from "@/components/helpers/timeFormatter";
import { Text } from "@/components/ui/theme";
import { useImageZoom } from "@/hooks/chatHooks/useImageZoom";
import { BlurView } from "expo-blur";
import { Image as ExpoImage } from "expo-image";
import {
  Check,
  CheckCheck,
  Crown,
  FileText,
  Pin,
  PinOff,
  Reply,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ImageZoomModal } from "./ImageZoomModal";
import { AudioPlayer } from "./audioPlayer";
import { PremiumAvatar } from "./avatarPrimuim";
import { COLORS } from "./chatData/messageBubbleColor";
import events from "./events";
import { hs, ms, vs } from "../../ui/theme";

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  onPin,
  onReply,
  onReact,
  status = "sent",
}) {
  const [showReactions, setShowReactions] = useState(false);
  const { openZoom, closeZoom, zoomedImage } = useImageZoom();

  // ── Handlers (sans shared values — New Architecture safe) ──
  const handleLongPress = useCallback(() => {
    setShowReactions(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setShowReactions(false);
  }, []);

  const handleSelectEmoji = useCallback(
    (emoji) => {
      setShowReactions(false);
      onReact?.(emoji);
    },
    [onReact],
  );

  useEffect(() => {
    const off = events.on("chat:dismissAll", () => setShowReactions(false));
    return () => off();
  }, []);

  const handleImagePress = useCallback(() => {
    if (message.attachment?.url && message.attachment?.type === "image") {
      openZoom(message.attachment.url, "message");
    }
  }, [message.attachment, openZoom]);

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
        entering={FadeIn.duration(200)}
        style={[
          styles.row,
          isOwn ? styles.rowOwn : styles.rowOther,
          hasReactions && styles.rowWithReactions,
        ]}
      >
        {/* Avatar gauche */}
        {!isOwn && (
          <View style={styles.avatarSlot}>
            {showAvatar ? (
              <PremiumAvatar
                name={message.senderName}
                photoURL={message.senderAvatar}
                isTrainer={message.senderRole === "trainer"}
                isOwn={false}
              />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </View>
        )}

        <View style={[styles.bubbleWrapper, isOwn && styles.bubbleWrapperOwn]}>
          {/* Nom expéditeur */}
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
                    <Text style={styles.docSubtitle}>Appuyer pour ouvrir</Text>
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

          {/* Barre emoji (long press menu) */}
          {showReactions && (
            <Animated.View
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(150)}
              style={[
                styles.emojiBar,
                isOwn ? styles.emojiBarOwn : styles.emojiBarOther,
              ]}
            >
              {["👍", "❤️", "😂", "😮", "🔥", "🙏"].map((emoji) => (
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
                style={[
                  styles.actionBtn,
                  message.pinned && styles.pinBtnActive,
                ]}
                onPress={() => {
                  handleDismiss();
                  onPin?.(message.id, !message.pinned);
                  events.emit("chat:dismissAll");
                }}
              >
                {message.pinned ? (
                  <PinOff size={13} color="#F59E0B" />
                ) : (
                  <Pin size={13} color="rgba(255,255,255,0.7)" />
                )}
              </TouchableOpacity>

              <View style={styles.emojiDivider} />

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  handleDismiss();
                  onReply?.(message);
                  events.emit("chat:dismissAll");
                }}
              >
                <Reply size={13} color="rgba(255,255,255,0.7)" />
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
                photoURL={message.senderAvatar}
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
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: vs(6),
    paddingHorizontal: hs(10),
  },
  rowOwn: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },
  rowWithReactions: { marginBottom: vs(20) },
  avatarSlot: {
    width: hs(40),
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: vs(2),
  },
  avatarPlaceholder: { width: hs(36), height: vs(36) },
  bubbleWrapper: { maxWidth: "74%", marginHorizontal: hs(4) },
  bubbleWrapperOwn: { alignItems: "flex-end" },
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
    marginBottom: vs(4),
    marginLeft: hs(6),
  },
  senderName: {
    fontSize: ms(11),
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.4,
  },
  trainerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(3),
    backgroundColor: "rgba(167,139,250,0.12)",
    borderWidth: ms(1),
    borderColor: "rgba(167,139,250,0.3)",
    paddingHorizontal: hs(7),
    paddingVertical: vs(2),
    borderRadius: ms(6),
  },
  trainerBadgeText: {
    fontSize: ms(9),
    color: COLORS.trainer,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  bubble: {
    paddingHorizontal: hs(14),
    paddingVertical: vs(10),
    borderRadius: ms(20),
    overflow: "hidden",
    borderWidth: ms(1),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: ms(12),
    elevation: 6,
  },
  bubbleOwn: {
    borderBottomRightRadius: ms(4),
    backgroundColor: COLORS.ownBubble,
    borderColor: COLORS.ownBorder,
  },
  bubbleOther: {
    borderBottomLeftRadius: ms(4),
    backgroundColor: COLORS.otherBubble,
    borderColor: COLORS.otherBorder,
  },
  bubblePinned: {
    borderColor: "rgba(245,158,11,0.55)",
    borderWidth: ms(1.5),
  },
  bubbleImageOnly: {
    paddingHorizontal: hs(5),
    paddingVertical: vs(5),
    paddingBottom: vs(8),
  },
  bubbleShine: {
    position: "absolute",
    top: 0,
    left: "15%",
    right: "15%",
    height: vs(1),
    backgroundColor: "rgba(14,165,233,0.6)",
    borderRadius: ms(1),
  },
  pinnedBadge: { marginBottom: vs(6), alignSelf: "flex-start" },
  pinnedText: {
    fontSize: ms(10),
    color: COLORS.pinned,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  replyContainer: {
    flexDirection: "row",
    marginBottom: vs(8),
    backgroundColor: COLORS.replyBg,
    borderRadius: ms(10),
    padding: ms(8),
    overflow: "hidden",
  },
  replyAccentLine: {
    width: hs(2.5),
    backgroundColor: COLORS.ownAccent,
    borderRadius: ms(2),
    marginRight: hs(8),
  },
  replyContent: { flex: 1 },
  replyName: {
    fontSize: ms(10),
    fontWeight: "700",
    color: COLORS.ownAccent,
    marginBottom: vs(2),
    letterSpacing: 0.2,
  },
  replyText: { fontSize: ms(11), color: "rgba(255,255,255,0.5)" },
  imageWrapper: {
    borderRadius: ms(14),
    overflow: "hidden",
    position: "relative",
  },
  attachmentImage: { width: hs(220), height: vs(180), borderRadius: ms(14) },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: ms(14),
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    height: vs(60),
    width: hs(220),
    backgroundColor: "rgba(14,165,233,0.08)",
    borderWidth: ms(1),
    borderColor: "rgba(14,165,233,0.22)",
    borderRadius: ms(14),
    padding: ms(12),
    gap: ms(10),
  },
  docIconBg: {
    width: hs(40),
    height: vs(40),
    borderRadius: ms(12),
    backgroundColor: "rgba(14,165,233,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  docMeta: { flex: 1 },
  docTitle: {
    fontSize: ms(13),
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: vs(2),
  },
  docSubtitle: { fontSize: ms(10), color: "rgba(14,165,233,0.7)" },
  docArrow: {
    width: hs(24),
    height: vs(24),
    borderRadius: ms(12),
    backgroundColor: "rgba(14,165,233,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  docArrowText: {
    fontSize: ms(18),
    color: COLORS.ownAccent,
    marginTop: vs(-2),
  },
  messageText: {
    fontSize: ms(15),
    lineHeight: vs(22),
    color: COLORS.text,
    fontWeight: "400",
    letterSpacing: 0.1,
  },
  messageTextOwn: { color: COLORS.textOwn },
  messageTextWithAttachment: { marginTop: vs(8) },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: vs(5),
    gap: hs(5),
  },
  time: { fontSize: ms(10), color: COLORS.textMuted, letterSpacing: 0.2 },
  timeOwn: { color: "rgba(255,255,255,0.5)" },
  statusDot: { flexDirection: "row", alignItems: "center" },
  reactionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: hs(3),
    position: "absolute",
    bottom: vs(-14),
  },
  reactionsRowOwn: { right: hs(8) },
  reactionsRowOther: { left: hs(8) },
  reactionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.reactionBg,
    borderRadius: ms(14),
    paddingHorizontal: hs(7),
    paddingVertical: vs(3),
    gap: ms(3),
    borderWidth: ms(1),
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.3,
    shadowRadius: ms(4),
    elevation: 3,
  },
  reactionChipEmoji: { fontSize: ms(13) },
  reactionChipCount: {
    fontSize: ms(10),
    color: "rgba(255,255,255,0.65)",
    fontWeight: "700",
  },
  emojiBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.reactionBg,
    borderRadius: ms(28),
    paddingHorizontal: hs(6),
    paddingVertical: vs(5),
    marginTop: vs(6),
    gap: hs(2),
    borderWidth: ms(1),
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(8) },
    shadowOpacity: 0.4,
    shadowRadius: ms(16),
    elevation: 10,
  },
  emojiBarOwn: { alignSelf: "flex-end" },
  emojiBarOther: { alignSelf: "flex-start" },
  emojiBtn: {
    width: hs(36),
    height: vs(36),
    borderRadius: ms(18),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  emojiBtnText: { fontSize: ms(18) },
  emojiDivider: {
    width: hs(1),
    height: vs(22),
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: hs(3),
  },
  actionBtn: {
    width: hs(36),
    height: vs(36),
    borderRadius: ms(18),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  pinBtnActive: {
    backgroundColor: "rgba(245,158,11,0.15)",
  },
});
