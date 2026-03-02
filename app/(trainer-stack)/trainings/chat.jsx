import { useAuth } from "@/components/constants/authContext";
import { MessageBubble } from "@/components/features/chat/MessageBubble";
import { MyLoader } from "@/components/ui/loader";
import { useChat } from "@/hooks/chatHooks/useChatMessage";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FileText, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  FadeIn,
  FadeInDown,
  FadeOut,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatBackground } from "../../../components/features/chat/ChatBackground";
import { ChatHeader } from "../../../components/features/chat/chatHeader";
import { ChatInput } from "../../../components/features/chat/chatInput";
import { EmptyChat } from "../../../components/features/chat/emptyChat";
import events from "../../../components/features/chat/events";
import { PinnedBanner } from "../../../components/features/chat/pinnedBanner";
import { useMediaPicker } from "../../../hooks/chatHooks/useMediaPicker";
import { useChatFilesUpload } from "../../../hooks/chatHooks/useUploadChatfilesToCloudinary";
import { useVoiceRecorder } from "../../../hooks/chatHooks/useVoiceRecorder";

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { trainingId, trainingTitle, trainingColor } = useLocalSearchParams();

  // Refs & Animation
  const flatListRef = useRef(null);
  const scrollY = useSharedValue(0);

  // States
  const [selectedFile, setSelectedFile] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [sendingVoice, setSendingVoice] = useState(false);

  const soundRef = useRef(null); // Pour stopper la lecture avant d'enregistrer

  // Custom Hooks
  const {
    messages,
    pinnedMessages,
    inputText,
    setInputText,
    loading,
    sending,
    error,
    hasMoreMessages,
    loadMoreMessages,
    typingUsers,
    setTyping,
    sendMessage,
    togglePin,
    markAsRead,
    toggleReaction,
    learnerCount,
  } = useChat(trainingId, user);

  const {
    startRecording,
    stopRecording,
    isRecording,
    formattedDuration,
    progress,
  } = useVoiceRecorder();
  const { uploadFile, uploading } = useChatFilesUpload();
  const { pickImage, takePhoto, pickDocument } = useMediaPicker();

  // --- Handlers ---

  const handleAttach = async (type) => {
    let result = null;
    if (type === "image") result = await pickImage();
    if (type === "camera") result = await takePhoto();
    if (type === "file") result = await pickDocument();

    if (result) {
      setSelectedFile(result);
    }
  };

  const handleSend = useCallback(async () => {
    if (!inputText.trim() && !selectedFile) return;

    try {
      let attachment = null;

      if (selectedFile) {
        const attachmentUrl = await uploadFile(
          selectedFile.uri,
          selectedFile.type,
        );
        attachment = { url: attachmentUrl, type: selectedFile.type };
      }

      await sendMessage(inputText, replyingTo?.id || null, attachment);

      // Reset
      setInputText("");
      setSelectedFile(null);
      setReplyingTo(null);
    } catch (err) {
      console.error("Erreur lors de l'envoi:", err);
    }
  }, [
    inputText,
    selectedFile,
    replyingTo,
    sendMessage,
    uploadFile,
    setInputText,
  ]);

  const handleStartVoice = () => {
    // Stop any audio playback before recording
    soundRef.current?.stopAsync?.();
    startRecording();
  };

  // toggler appelé depuis l'input : démarre si on n'enregistre pas,
  // sinon stoppe-et-envoie
  const handleToggleVoice = () => {
    if (isRecording) {
      handleVoiceSend();
    } else {
      handleStartVoice();
    }
  };

  const handleVoiceSend = async () => {
    if (sendingVoice) return; // Prévenir double envoi
    setSendingVoice(true);
    const result = await stopRecording(); // { uri, cancelled }

    if (!result || result.cancelled || !result.uri) return;

    try {
      // result.uri est maintenant sûr
      const audioUrl = await uploadFile(result.uri, "audio");

      const attachment = { url: audioUrl, type: "audio" };
      await sendMessage("", null, attachment);
    } catch (err) {
      console.error("Erreur envoi vocal:", err);
    } finally {
      setSendingVoice(false);
    }
  };

  // --- Mémos & Styles Animés ---

  const reversedMessages = useMemo(() => {
    const grouped = messages.map((item, index) => ({
      ...item,
      showAvatar:
        index === 0 || messages[index - 1]?.senderId !== item.senderId,
    }));
    return [...grouped].reverse();
  }, [messages]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [1, 0.9], Extrapolate.CLAMP),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 100],
          [0, -5],
          Extrapolate.CLAMP,
        ),
      },
    ],
  }));

  // --- Effects ---

  useEffect(() => {
    if (messages.length > 0 && user) {
      markAsRead(messages[messages.length - 1].id);
    }
  }, [messages, user, markAsRead]);

  if (error) return <MyLoader message={`Erreur : ${error}`} />;

  return (
    <KeyboardAvoidingView
      style={styles.bgContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <Pressable
        onPress={() => {
          events.emit("chat:dismissAll");
        }}
        style={styles.bgContainer}
      >
        <ChatBackground intensity="medium">
          <Animated.View
            style={[
              styles.headerWrapper,
              headerStyle,
              { paddingTop: insets.top },
            ]}
          >
            <ChatHeader
              title={trainingTitle}
              messageCount={messages.length}
              onBack={() => router.back()}
              insets={insets}
              color={trainingColor}
              learners={learnerCount}
            />
          </Animated.View>

          <View style={styles.mainContent}>
            {pinnedMessages.length > 0 && (
              <Animated.View
                entering={FadeInDown}
                style={styles.pinnedContainer}
              >
                <BlurView intensity={80} tint="dark" style={styles.pinnedBlur}>
                  <PinnedBanner
                    messages={pinnedMessages}
                    onDismiss={() => togglePin(pinnedMessages[0].id, false)}
                  />
                </BlurView>
              </Animated.View>
            )}

            {loading && messages.length === 0 ? (
              <MyLoader message="Chargement..." />
            ) : messages.length === 0 ? (
              <EmptyChat
                onStartChat={() => setInputText("Bonjour ! 👋")}
                isTrainer={user?.role === "trainer"}
              />
            ) : (
              <Animated.FlatList
                ref={flatListRef}
                data={reversedMessages}
                inverted
                keyExtractor={(item) => item.id}
                onScroll={scrollHandler}
                contentContainerStyle={styles.listPadding}
                renderItem={({ item }) => (
                  <MessageBubble
                    message={item}
                    isOwn={item.senderId === user?.uid}
                    isTrainer={user?.role === "trainer"}
                    onLongPress={() => togglePin(item.id, !item.pinned)}
                    onReply={() => setReplyingTo(item)}
                    showAvatar={item.showAvatar}
                    onReact={(emoji) => toggleReaction(item.id, emoji)}
                  />
                )}
                onEndReached={() => hasMoreMessages && loadMoreMessages()}
                onEndReachedThreshold={0.3}
              />
            )}

            {Object.keys(typingUsers || {}).length > 0 && (
              <Animated.View
                entering={FadeIn.duration(300)}
                exiting={FadeOut}
                style={styles.typingBox}
              >
                <Text style={styles.typingText}>
                  {Object.values(typingUsers).join(", ")} est en train
                  d'écrire...
                </Text>
              </Animated.View>
            )}
          </View>

          {/* PREVIEW PIÈCE JOINTE */}
          {selectedFile && (
            <Animated.View
              entering={FadeInDown}
              exiting={FadeOut}
              style={styles.previewContainer}
            >
              <BlurView intensity={90} tint="dark" style={styles.previewBlur}>
                {selectedFile.type === "image" ? (
                  <Image
                    source={{ uri: selectedFile.uri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.previewDoc}>
                    <FileText color="#3B82F6" size={24} />
                    <Text style={styles.previewDocText} numberOfLines={1}>
                      Document sélectionné
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.closePreview}
                  onPress={() => setSelectedFile(null)}
                >
                  <X size={16} color="#FFF" />
                </TouchableOpacity>
                {uploading && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator color="#3B82F6" />
                  </View>
                )}
              </BlurView>
            </Animated.View>
          )}

          <ChatInput
            value={inputText}
            onChange={(text) => {
              setInputText(text);
              setTyping(text.length > 0);
            }}
            onSend={handleSend}
            sending={sending}
            insets={insets}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            onAttach={handleAttach}
            hasAttachment={!!selectedFile}
            onToggleVoice={handleToggleVoice}
            isRecording={isRecording}
            formattedDuration={formattedDuration}
            progress={progress}
          />
        </ChatBackground>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bgContainer: { flex: 1, backgroundColor: "#070B14" },
  headerWrapper: { zIndex: 10, backgroundColor: "rgba(7, 11, 20, 0.7)" },
  mainContent: { flex: 1, position: "relative" },
  listPadding: { paddingHorizontal: 12, paddingBottom: 20, paddingTop: 10 },
  pinnedContainer: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    zIndex: 20,
    elevation: 5,
  },
  pinnedBlur: {
    borderRadius: 16,
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  typingBox: {
    position: "absolute",
    bottom: 10,
    left: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  typingText: { fontSize: 11, color: "#3B82F6", fontWeight: "600" },
  previewContainer: {
    position: "absolute",
    bottom: 145,
    left: 20,
    right: 20,
    zIndex: 30,
  },
  previewBlur: {
    borderRadius: 16,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  previewImage: { width: 60, height: 60, borderRadius: 10 },
  previewDoc: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  previewDocText: { color: "#FFF", fontSize: 13, flex: 1 },
  closePreview: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    padding: 4,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
