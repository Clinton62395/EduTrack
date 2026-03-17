import { BlurView } from "expo-blur";
import {
  Camera,
  FileText,
  ImageIcon,
  Plus,
  Send,
  Trash2,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Defs,
  Path,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";

import { hs, ms, vs } from "../../ui/theme";
import { ChatTextInput } from "./chatTextInput";
import { EmojiButton } from "./emojiButton";
import events from "./events";
import { MicButton } from "./recordingButton";
import { RecordingWave } from "./recordingWave";

export function ChatInput({
  value,
  onChange,
  onSend,
  sending,
  insets,
  onAttach,
  placeholder = "Écrire un message...",
  maxLength = 1000,
  replyingTo,
  hasAttachment = false,
  onToggleVoice,
  onCancelVoice, // ✅ nouvelle prop
  isRecording,
  formattedDuration,
  progress,
  metering = 0, // ✅ nouvelle prop pour la wave
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);

  // ✅ Animated react-native uniquement — plus de Reanimated
  const expandAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const cancelOpacity = useRef(new Animated.Value(0)).current;

  const inputRef = useRef(null);
  const canSend = (value.trim().length > 0 || hasAttachment) && !sending;

  // ── Expand panneau options ──
  const toggleExpand = () => {
    const target = isExpanded ? 0 : 1;
    Animated.parallel([
      Animated.spring(expandAnim, { toValue: target, useNativeDriver: false }),
      Animated.spring(rotateAnim, { toValue: target, useNativeDriver: true }),
    ]).start();
    setIsExpanded(!isExpanded);
  };

  const plusRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const expandHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  // ── PanResponder swipe gauche pour annuler (style WhatsApp) ──
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isRecording,
      onMoveShouldSetPanResponder: () => isRecording,
      onPanResponderMove: (_, { dx }) => {
        if (dx < -30) {
          if (!cancelMode) setCancelMode(true);
          Animated.timing(cancelOpacity, {
            toValue: Math.min(1, Math.abs(dx) / 80),
            duration: 50,
            useNativeDriver: true,
          }).start();
        } else {
          if (cancelMode) setCancelMode(false);
          Animated.timing(cancelOpacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderRelease: (_, { dx }) => {
        cancelOpacity.setValue(0);
        setCancelMode(false);
        if (dx < -60) {
          // swipe suffisant → annuler
          onCancelVoice?.();
        } else {
          // relâché sans swipe → envoyer
          onToggleVoice?.();
        }
      },
    }),
  ).current;

  const toggleEmoji = () => {
    setShowEmojiPicker(!showEmojiPicker);
    if (!showEmojiPicker) inputRef.current?.blur();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      {(showEmojiPicker || isExpanded) && (
        <Modal
          transparent
          animationType="none"
          visible
          onRequestClose={() => {}}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              setShowEmojiPicker(false);
              Animated.parallel([
                Animated.spring(expandAnim, {
                  toValue: 0,
                  useNativeDriver: false,
                }),
                Animated.spring(rotateAnim, {
                  toValue: 0,
                  useNativeDriver: true,
                }),
              ]).start();
              setIsExpanded(false);
              events.emit("chat:dismissAll");
            }}
          />
        </Modal>
      )}

      {/* BARRE D'EMOJIS RAPIDES */}
      {showEmojiPicker && (
        <View style={styles.quickEmojiBar}>
          {["👍", "❤️", "😂", "🔥", "👏", "🙏"].map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => onChange(value + emoji)}
            >
              <Text style={{ fontSize: 22 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* PANNEAU OPTIONS */}
      <Animated.View
        style={[
          styles.expandPanel,
          { height: expandHeight, overflow: "hidden" },
        ]}
      >
        <BlurView intensity={90} tint="light" style={styles.expandBlur}>
          <View style={styles.expandContent}>
            <OptionBtn
              icon={<ImageIcon size={20} color="#FFF" />}
              color="#3B82F6"
              label="Image"
              onPress={() => onAttach?.("image")}
            />
            <OptionBtn
              icon={<Camera size={20} color="#FFF" />}
              color="#8B5CF6"
              label="Caméra"
              onPress={() => onAttach?.("camera")}
            />
            <OptionBtn
              icon={<FileText size={20} color="#FFF" />}
              color="#10B981"
              label="Doc"
              onPress={() => onAttach?.("file")}
            />
          </View>
        </BlurView>
      </Animated.View>

      {/* ── MODE ENREGISTREMENT (WhatsApp style) ── */}
      {isRecording ? (
        <BlurView intensity={80} tint="light" style={styles.inputContainer}>
          <View style={styles.recordingRow}>
            {/* Bouton corbeille (annulation directe) */}
            <TouchableOpacity onPress={onCancelVoice} style={styles.cancelBtn}>
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>

            {/* Zone swipeable : wave + durée + hint */}
            <View style={styles.recordingCenter} {...panResponder.panHandlers}>
              <RecordingWave metering={metering} isRecording={isRecording} />
              <Text style={styles.recordingDuration}>{formattedDuration}</Text>

              {/* "← Glisser pour annuler" — apparaît au swipe */}
              <Animated.View
                style={[styles.swipeHint, { opacity: cancelOpacity }]}
              >
                <Text style={styles.swipeHintText}>← Annuler</Text>
              </Animated.View>
            </View>

            {/* Bouton envoyer */}
            <TouchableOpacity
              onPress={onToggleVoice}
              style={styles.sendVoiceBtn}
            >
              <Send size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </BlurView>
      ) : (
        /* ── MODE NORMAL ── */
        <BlurView intensity={80} tint="light" style={styles.inputContainer}>
          <View style={styles.content}>
            {/* BOUTON PLUS */}
            {!canSend && (
              <TouchableOpacity
                style={styles.attachButton}
                onPress={toggleExpand}
              >
                <Animated.View style={{ transform: [{ rotate: plusRotate }] }}>
                  <Plus size={22} color={isExpanded ? "#3B82F6" : "#64748B"} />
                </Animated.View>
              </TouchableOpacity>
            )}

            {/* INPUT */}
            <View style={styles.inputWrapper}>
              <ChatTextInput
                inputRef={inputRef}
                value={value}
                onChangeText={onChange}
                maxLength={maxLength}
                placeholder={replyingTo ? "Répondre..." : placeholder}
              />
            </View>

            {/* ACTIONS DROITE */}
            <View style={styles.actions}>
              <EmojiButton onPress={toggleEmoji} active={showEmojiPicker} />

              {!canSend && (
                <MicButton
                  onToggleVoice={onToggleVoice}
                  isRecording={isRecording}
                />
              )}

              {/* BOUTON ENVOYER */}
              <TouchableOpacity
                onPress={onSend}
                disabled={!canSend}
                style={[styles.sendButton, canSend && styles.sendButtonActive]}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Svg width={22} height={22} viewBox="0 0 24 24">
                    <Defs>
                      <SvgGradient
                        id="grad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <Stop offset="0%" stopColor="#3B82F6" />
                        <Stop offset="100%" stopColor="#8B5CF6" />
                      </SvgGradient>
                    </Defs>
                    <Path
                      d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
                      stroke={canSend ? "url(#grad)" : "#94A3B8"}
                      strokeWidth={2}
                      fill={canSend ? "url(#grad)" : "none"}
                      fillOpacity={0.2}
                    />
                  </Svg>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      )}
    </View>
  );
}

const OptionBtn = ({ icon, color, label, onPress }) => (
  <TouchableOpacity style={styles.expandOption} onPress={onPress}>
    <View style={[styles.optionIcon, { backgroundColor: color }]}>{icon}</View>
    <Text style={styles.optionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: ms(16), paddingTop: vs(8) },

  quickEmojiBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: ms(12),
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: ms(20),
    marginBottom: vs(8),
    elevation: ms(3),
  },

  expandPanel: { marginBottom: vs(8), borderRadius: ms(20) },
  expandBlur: { padding: ms(16) },
  expandContent: { flexDirection: "row", justifyContent: "space-around" },
  expandOption: { alignItems: "center", gap: ms(8) },

  optionIcon: {
    width: hs(48),
    height: vs(48),
    borderRadius: ms(24),
    justifyContent: "center",
    alignItems: "center",
  },

  optionText: { fontSize: ms(12), fontWeight: "600", color: "#1E293B" },

  inputContainer: {
    borderRadius: ms(30),
    overflow: "hidden",
    borderWidth: 1, // ⚠️ fixe
    borderColor: "rgba(203, 213, 225, 0.3)",
  },

  content: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: ms(10),
    paddingVertical: vs(6),
  },

  inputWrapper: {
    flex: 1,
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    borderRadius: ms(22),
    paddingHorizontal: ms(12),
    marginHorizontal: ms(4),
  },

  actions: { flexDirection: "row", alignItems: "center", gap: ms(4) },

  attachButton: {
    width: hs(40),
    height: vs(40),
    borderRadius: ms(20),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(248, 250, 252, 0.8)",
  },

  sendButton: {
    width: hs(44),
    height: vs(44),
    borderRadius: ms(22),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(226, 232, 240, 0.8)",
  },

  sendButtonActive: { backgroundColor: "rgba(37, 99, 235, 0.9)" },

  // ── Mode enregistrement ──
  recordingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ms(10),
    paddingVertical: vs(8),
    gap: ms(8),
  },

  cancelBtn: {
    width: hs(40),
    height: vs(40),
    borderRadius: ms(20),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },

  recordingCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
    overflow: "hidden",
    position: "relative",
  },

  recordingDuration: {
    fontSize: ms(13),
    color: "#EF4444",
    fontWeight: "600",
    minWidth: hs(38),
  },

  swipeHint: {
    position: "absolute",
    right: 0,
    backgroundColor: "rgba(239,68,68,0.12)",
    paddingHorizontal: ms(10),
    paddingVertical: vs(4),
    borderRadius: ms(12),
  },

  swipeHintText: {
    fontSize: ms(12),
    color: "#EF4444",
    fontWeight: "600",
  },

  sendVoiceBtn: {
    width: hs(44),
    height: vs(44),
    borderRadius: ms(22),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(37, 99, 235, 0.9)",
  },
});
