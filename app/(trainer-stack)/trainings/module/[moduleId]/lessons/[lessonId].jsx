import { useAuth } from "@/components/constants/authContext";
import { useLessonQuery } from "@/components/features/learnerProfile/hooks/useLessonsQuery";
import { MyLoader } from "@/components/ui/loader";
import { Snack } from "@/components/ui/snackbar";
import { Text } from "@/components/ui/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  ExternalLink,
  FileText,
  Layers,
  Play,
} from "lucide-react-native";
import { useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─────────────────────────────────────────
// 🎨 CONFIG TYPE
// ─────────────────────────────────────────
const TYPE_CONFIG = {
  text: {
    label: "Lecture",
    icon: BookOpen,
    color: "#2563EB",
    bg: "#EFF6FF",
    accent: "#BFDBFE",
  },
  video: {
    label: "Vidéo",
    icon: Play,
    color: "#DC2626",
    bg: "#FEF2F2",
    accent: "#FECACA",
  },
  pdf: {
    label: "Document PDF",
    icon: FileText,
    color: "#D97706",
    bg: "#FFFBEB",
    accent: "#FDE68A",
  },
};

// ─────────────────────────────────────────
// 🧩 MAIN SCREEN
// ─────────────────────────────────────────
export default function LessonDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { lessonId, moduleId, formationId, isLearner } = useLocalSearchParams();
  const isLearnerMode = isLearner === "true";

  const { lesson, loading, isCompleted, completing, completeLesson } =
    useLessonQuery({
      formationId,
      moduleId,
      lessonId,
      userId: user?.uid,
      isLearnerMode,
    });

  const [snack, setSnack] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showSnack = (message, type = "success") =>
    setSnack({ visible: true, message, type });

  const dismissSnack = () => setSnack((prev) => ({ ...prev, visible: false }));

  const handleComplete = async () => {
    const result = await completeLesson();
    if (result?.success) {
      showSnack("Leçon marquée comme terminée 🎉");
      setTimeout(() => router.back(), 1500);
    } else {
      showSnack("Une erreur est survenue", "error");
    }
  };

  const handleOpenLink = () => {
    if (lesson?.content) Linking.openURL(lesson.content);
  };

  if (loading) return <MyLoader message="Chargement de la leçon..." />;

  if (!lesson) return <LessonNotFound />;

  const typeConfig = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.text;

  // Calcul du padding bottom pour éviter que le bouton soit masqué
  // par la barre de navigation native du téléphone
  const bottomPadding = insets.bottom + 80 + 16;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LessonHeader
        lesson={lesson}
        router={router}
        insets={insets}
        typeConfig={typeConfig}
        isCompleted={isCompleted}
        isLearnerMode={isLearnerMode}
      />

      {/* CONTENU */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: isLearnerMode && !isCompleted ? bottomPadding : 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* BADGE TYPE + META */}
        <LessonMeta lesson={lesson} typeConfig={typeConfig} />

        {/* CONTENU PRINCIPAL */}
        <LessonContent
          lesson={lesson}
          onOpenLink={handleOpenLink}
          typeConfig={typeConfig}
        />

        {/* BADGE COMPLETÉ */}
        {isLearnerMode && isCompleted && <CompletedBadge />}
      </ScrollView>

      {/* BOUTON FOOTER — ancré au dessus de la tab bar */}
      {isLearnerMode && !isCompleted && (
        <CompletionFooter
          insets={insets}
          completing={completing}
          onPress={handleComplete}
        />
      )}

      <Snack
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={dismissSnack}
      />
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 HEADER
// ─────────────────────────────────────────
function LessonHeader({
  lesson,
  router,
  insets,
  typeConfig,
  isCompleted,
  isLearnerMode,
}) {
  const Icon = typeConfig.icon;

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {/* Bande colorée en haut */}
      <View
        style={[styles.headerAccent, { backgroundColor: typeConfig.color }]}
      />

      <View style={styles.headerContent}>
        {/* Bouton retour */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={22} color="#111827" />
        </TouchableOpacity>

        {/* Infos leçon */}
        <View style={styles.headerInfo}>
          {/* Badge type */}
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: typeConfig.bg,
                borderColor: typeConfig.accent,
              },
            ]}
          >
            <Icon size={13} color={typeConfig.color} />
            <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>
              {typeConfig.label}
            </Text>
            {lesson.duration && (
              <>
                <View
                  style={[
                    styles.badgeDot,
                    { backgroundColor: typeConfig.accent },
                  ]}
                />
                <Clock size={11} color={typeConfig.color} />
                <Text
                  style={[styles.typeBadgeText, { color: typeConfig.color }]}
                >
                  {lesson.duration} min
                </Text>
              </>
            )}
          </View>

          {/* Titre */}
          <Text style={styles.headerTitle} numberOfLines={2}>
            {lesson.title}
          </Text>
        </View>

        {/* Indicateur complété dans le header */}
        {isLearnerMode && isCompleted && (
          <View style={styles.completedIndicator}>
            <CheckCircle2 size={20} color="#10B981" />
          </View>
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 META (module info)
// ─────────────────────────────────────────
function LessonMeta({ lesson, typeConfig }) {
  return (
    <View style={styles.metaContainer}>
      <View style={[styles.metaIconBox, { backgroundColor: typeConfig.bg }]}>
        <Layers size={16} color={typeConfig.color} />
      </View>
      <Text style={styles.metaText}>
        Contenu {typeConfig.label.toLowerCase()}
        {lesson.duration ? ` · ${lesson.duration} min de lecture` : ""}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 CONTENU
// ─────────────────────────────────────────
function LessonContent({ lesson, onOpenLink, typeConfig }) {
  if (lesson.type === "text") {
    return (
      <View style={styles.textCard}>
        <Text style={styles.textContent}>{lesson.content}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mediaCard}>
      {/* Preview visuelle */}
      <MediaPreview type={lesson.type} typeConfig={typeConfig} />

      {/* Description si présente */}
      {lesson.description && (
        <Text style={styles.mediaDescription}>{lesson.description}</Text>
      )}

      {/* Bouton ouvrir */}
      <TouchableOpacity
        onPress={onOpenLink}
        style={[styles.openButton, { backgroundColor: typeConfig.color }]}
        activeOpacity={0.85}
      >
        <ExternalLink size={16} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.openButtonText}>
          Ouvrir {lesson.type === "pdf" ? "le document" : "la vidéo"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 MEDIA PREVIEW
// ─────────────────────────────────────────
function MediaPreview({ type, typeConfig }) {
  const Icon = typeConfig.icon;

  return (
    <View
      style={[
        styles.previewBox,
        { backgroundColor: typeConfig.bg, borderColor: typeConfig.accent },
      ]}
    >
      {/* Cercles décoratifs */}
      <View
        style={[
          styles.previewCircle,
          styles.previewCircleLarge,
          { backgroundColor: typeConfig.accent, opacity: 0.4 },
        ]}
      />
      <View
        style={[
          styles.previewCircle,
          styles.previewCircleSmall,
          { backgroundColor: typeConfig.accent, opacity: 0.6 },
        ]}
      />

      {/* Icône centrale */}
      <View
        style={[styles.previewIconBox, { backgroundColor: typeConfig.color }]}
      >
        <Icon size={28} color="white" />
      </View>

      <Text style={[styles.previewLabel, { color: typeConfig.color }]}>
        {type === "pdf" ? "Document PDF" : "Contenu vidéo"}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 COMPLETED BADGE
// ─────────────────────────────────────────
function CompletedBadge() {
  return (
    <View style={styles.completedBadge}>
      <View style={styles.completedIconBox}>
        <CheckCircle2 size={22} color="#10B981" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.completedTitle}>Leçon terminée</Text>
        <Text style={styles.completedSub}>
          Vous avez complété cette leçon avec succès
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 COMPLETION FOOTER
// ─────────────────────────────────────────
function CompletionFooter({ insets, completing, onPress }) {
  // paddingBottom = insets.bottom pour être juste au dessus de la tab bar
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={completing}
        style={[
          styles.completeButton,
          completing && styles.completeButtonDisabled,
        ]}
        activeOpacity={0.85}
      >
        {completing ? (
          <Text style={styles.completeButtonText}>Enregistrement...</Text>
        ) : (
          <>
            <CheckCircle2 size={18} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.completeButtonText}>Marquer comme terminé</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 NOT FOUND
// ─────────────────────────────────────────
function LessonNotFound() {
  return (
    <View style={styles.notFound}>
      <BookOpen size={48} color="#D1D5DB" />
      <Text style={styles.notFoundTitle}>Leçon introuvable</Text>
      <Text style={styles.notFoundSub}>
        Cette leçon n&apos;existe pas ou a été supprimée
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────
// 🎨 STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // HEADER
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 3 },
    }),
  },
  headerAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  headerInfo: {
    flex: 1,
    gap: 6,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  badgeDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 24,
  },
  completedIndicator: {
    marginTop: 4,
  },

  // META
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
  },
  metaIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },

  // TEXT CARD
  textCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  textContent: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 26,
    letterSpacing: 0.2,
  },

  // MEDIA CARD
  mediaCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  previewBox: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
  },
  previewCircle: {
    position: "absolute",
    borderRadius: 999,
  },
  previewCircleLarge: {
    width: 160,
    height: 160,
    top: -40,
    right: -40,
  },
  previewCircleSmall: {
    width: 100,
    height: 100,
    bottom: -30,
    left: -20,
  },
  previewIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  mediaDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 16,
  },
  openButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  openButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },

  // COMPLETED BADGE
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 20,
  },
  completedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
  },
  completedSub: {
    fontSize: 12,
    color: "#059669",
    marginTop: 2,
  },

  // FOOTER
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -3 },
      },
      android: { elevation: 8 },
    }),
  },
  completeButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  completeButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  completeButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // NOT FOUND
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8FAFC",
  },
  notFoundTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
  },
  notFoundSub: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
