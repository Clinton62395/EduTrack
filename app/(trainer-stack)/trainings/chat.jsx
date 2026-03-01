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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
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
import { PinnedBanner } from "../../../components/features/chat/pinnedBanner";
import { useMediaPicker } from "../../../hooks/chatHooks/useMediaPicker";
import { useChatFilesUpload } from "../../../hooks/chatHooks/useUploadChatfilesToCloudinary";

const { width } = Dimensions.get("window");

// ─── 2. ÉCRAN PRINCIPAL ───
export default function ChatScreen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const router = useRouter();

  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { trainingId, trainingTitle, trainingColor } = useLocalSearchParams();

  // Refs & Animation Shared Values
  const flatListRef = useRef(null);
  const scrollY = useSharedValue(0);

  // States
  const [replyingTo, setReplyingTo] = useState(null);

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
  } = useChat(trainingId, user);

  // ─────────────────────────────────────────────────────
  // 📡 UPLOAD DE CHATFILES
  // ─────────────────────────────────────────────────────
  const { uploadFile, uploading } = useChatFilesUpload();
  const { pickImage, takePhoto, pickDocument } = useMediaPicker();

  // ── Logic: Inversion de la liste pour performance ──
  // En inversant la liste, le bas devient le haut (index 0).
  // Cela gère nativement le maintien du scroll lors de l'arrivée de messages.

  const handleAttach = async (type) => {
    let result = null;

    if (type === "image") result = await pickImage();
    if (type === "camera") result = await takePhoto();
    if (type === "file") result = await pickDocument();

    if (result) {
      setSelectedFile(result); // On stocke {uri, type}
    }
  };

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

  const handleSend = useCallback(async () => {
    // On autorise l'envoi si on a du texte OU un fichier
    if (!inputText.trim() && !selectedFile) return;

    try {
      let attachmentUrl = null;
      let fileType = null;

      // 1. Upload vers Cloudinary si un fichier est présent
      if (selectedFile) {
        attachmentUrl = await uploadFile(selectedFile.uri, selectedFile.type);
        fileType = selectedFile.type;
      }

      // 2. Préparation des données pour useChat.sendMessage
      // On adapte sendMessage dans useChat pour accepter un objet attachment
      const attachment = attachmentUrl
        ? { url: attachmentUrl, type: fileType }
        : null;

      if (replyingTo) {
        sendMessage(inputText, replyingTo.id, attachment);
        setReplyingTo(null);
      } else {
        sendMessage(inputText, null, attachment);
      }

      // 3. Reset
      setInputText("");
      setSelectedFile(null);
    } catch (err) {
      console.error("Erreur lors de l'envoi:", err);
      // Optionnel: Alert.alert("Erreur", "Impossible d'envoyer le fichier.");
    }
  }, [inputText, selectedFile, replyingTo, sendMessage, uploadFile]);
  // Effects
  useEffect(() => {
    if (messages.length > 0 && user) {
      markAsRead(messages[messages.length - 1].id);
    }
  }, [messages.length]);

  if (error) return <MyLoader message={`Erreur : ${error}`} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#070B14" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ChatBackground intensity="medium">
        {/* Header Animé */}
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
          />
        </Animated.View>

        <View style={styles.mainContent}>
          {/* Bannière épinglée (Glassmorphism) */}
          {pinnedMessages.length > 0 && (
            <Animated.View entering={FadeInDown} style={styles.pinnedContainer}>
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
              inverted // <--- Crucial pour le chat
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
                  onReact={(emoji) => {
                    toggleReaction(item.id, emoji);
                  }}
                />
              )}
              onEndReached={() => hasMoreMessages && loadMoreMessages()}
              onEndReachedThreshold={0.3}
            />
          )}

          {/* Indicateur de saisie flottant */}
          {Object.keys(typingUsers || {}).length > 0 && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut}
              style={styles.typingBox}
            >
              <Text style={styles.typingText}>
                {Object.values(typingUsers).join(", ")} est en train d'écrire...
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
        {/* Input de Chat */}
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
        />
      </ChatBackground>
    </KeyboardAvoidingView>
  );
}

// ─── 3. STYLES ───
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

  // ─────────────────────────────────────────────────────
  // PREVIEW PIÈCE JOINTE
  // ─────────────────────────────────────────────────────

  previewContainer: {
    position: "absolute",
    bottom: 145, // Juste au dessus de l'input
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
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
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
