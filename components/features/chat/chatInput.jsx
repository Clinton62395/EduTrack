// ChatInput.js
import { BlurView } from "expo-blur";
import { Camera, FileText, ImageIcon, Plus } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  FadeInUp,
  FadeOutDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Defs,
  Path,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";

import { ChatTextInput } from "./chatTextInput";
import { EmojiButton } from "./emojiButton";

import events from "./events";
import { MicButton, VoiceProgressCircle } from "./recordingButton";

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
  onToggleVoice, // nouvelle prop unique
  isRecording,
  formattedDuration,
  progress,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const expandAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);
  const inputRef = useRef(null);

  const canSend = (value.trim().length > 0 || hasAttachment) && !sending;

  // 🔹 Animation pour cacher les boutons uniquement si texte présent
  const hideButtonStyle = useAnimatedStyle(() => ({
    width: withTiming(canSend ? 0 : 40, { duration: 250 }),
    opacity: withTiming(canSend ? 0 : 1, { duration: 200 }),
    marginRight: withTiming(canSend ? -8 : 0),
    transform: [{ scale: withTiming(canSend ? 0 : 1) }],
  }));

  const plusRotateStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(rotateAnim.value, [0, 1], [0, 45])}deg` },
    ],
  }));

  const expandStyle = useAnimatedStyle(() => ({
    height: interpolate(expandAnim.value, [0, 1], [0, 120], Extrapolate.CLAMP),
    opacity: withTiming(expandAnim.value, { duration: 200 }),
  }));

  const toggleExpand = () => {
    const target = isExpanded ? 0 : 1;
    expandAnim.value = withSpring(target);
    rotateAnim.value = withSpring(target);
    setIsExpanded(!isExpanded);
  };

  const toggleEmoji = () => {
    setShowEmojiPicker(!showEmojiPicker);
    if (!showEmojiPicker) inputRef.current?.blur();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      {/* Full-screen transparent modal to capture taps outside and dismiss panels */}
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
              // collapse expand panel
              expandAnim.value = withSpring(0);
              rotateAnim.value = withSpring(0);
              setIsExpanded(false);
              // notify other chat components to dismiss their states
              events.emit("chat:dismissAll");
            }}
          />
        </Modal>
      )}
      {/* BARRE D'EMOJIS RAPIDES */}
      {showEmojiPicker && (
        <Animated.View
          entering={FadeInUp}
          exiting={FadeOutDown}
          style={styles.quickEmojiBar}
        >
          {["👍", "❤️", "😂", "🔥", "👏", "🙏"].map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => onChange(value + emoji)}
            >
              <Text style={{ fontSize: 22 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* PANNEAU OPTIONS (Pièces jointes) */}
      <Animated.View style={[styles.expandPanel, expandStyle]}>
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

      {/* INPUT PRINCIPAL */}
      <BlurView intensity={80} tint="light" style={styles.inputContainer}>
        <View style={styles.content}>
          {/* BOUTON PLUS */}
          <Animated.View style={[hideButtonStyle, { overflow: "hidden" }]}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={toggleExpand}
            >
              <Animated.View style={plusRotateStyle}>
                <Plus size={22} color={isExpanded ? "#3B82F6" : "#64748B"} />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

          {/* WRAPPER INPUT */}
          <View style={styles.inputWrapper}>
            <ChatTextInput
              inputRef={inputRef}
              value={value}
              onChangeText={onChange}
              maxLength={maxLength}
              placeholder={replyingTo ? `Répondre...` : placeholder}
            />
          </View>

          {/* ACTIONS DROITE */}
          <View style={styles.actions}>
            <EmojiButton onPress={toggleEmoji} active={showEmojiPicker} />

            <Animated.View style={hideButtonStyle}>
              <MicButton
                onToggleVoice={onToggleVoice}
                isRecording={isRecording}
              />

              {isRecording && (
                <VoiceProgressCircle
                  progress={progress}
                  duration={formattedDuration}
                />
              )}
            </Animated.View>

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
                    <SvgGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
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
    </View>
  );
}

// Composant interne Option
const OptionBtn = ({ icon, color, label, onPress }) => (
  <TouchableOpacity style={styles.expandOption} onPress={onPress}>
    <View style={[styles.optionIcon, { backgroundColor: color }]}>{icon}</View>
    <Text style={styles.optionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8 },
  quickEmojiBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    marginBottom: 8,
    elevation: 3,
  },
  expandPanel: { marginBottom: 8, borderRadius: 20, overflow: "hidden" },
  expandBlur: { padding: 16 },
  expandContent: { flexDirection: "row", justifyContent: "space-around" },
  expandOption: { alignItems: "center", gap: 8 },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: { fontSize: 12, fontWeight: "600", color: "#1E293B" },
  inputContainer: {
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.3)",
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    borderRadius: 22,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  actions: { flexDirection: "row", alignItems: "center" },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(248, 250, 252, 0.8)",
  },
  actionButton: {
    width: 38,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(226, 232, 240, 0.8)",
  },
  sendButtonActive: { backgroundColor: "rgba(37, 99, 235, 0.9)" },
});
