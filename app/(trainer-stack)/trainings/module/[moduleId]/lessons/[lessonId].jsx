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
import { ms } from "../../../../../../components/ui/theme";

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
    borderBottomWidth: ms(1),
    borderBottomColor: "#F1F5F9",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: ms(8),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: 3 },
    }),
  },
  headerAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: ms(3),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: ms(16),
    paddingBottom: ms(16),
    gap: ms(12),
  },
  backButton: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(10),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginTop: ms(4),
  },
  headerInfo: {
    flex: 1,
    gap: ms(6),
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(20),
    borderWidth: ms(1),
    gap: ms(4),
  },
  typeBadgeText: {
    fontSize: ms(11),
    fontWeight: "600",
    letterSpacing: ms(0.3),
  },
  badgeDot: {
    width: ms(3),
    height: ms(3),
    borderRadius: ms(2),
  },
  headerTitle: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: ms(24),
  },
  completedIndicator: {
    marginTop: ms(4),
  },

  // META
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(8),
    marginHorizontal: ms(20),
    marginTop: ms(20),
    marginBottom: ms(4),
  },
  metaIconBox: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(8),
    justifyContent: "center",
    alignItems: "center",
  },
  metaText: {
    fontSize: ms(12),
    color: "#64748B",
    fontWeight: "500",
  },

  // TEXT CARD
  textCard: {
    backgroundColor: "white",
    borderRadius: ms(16),
    padding: ms(20),
    margin: ms(20),
    marginTop: ms(12),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: ms(12),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: 2 },
    }),
  },
  textContent: {
    fontSize: ms(15),
    color: "#334155",
    lineHeight: ms(26),
    letterSpacing: ms(0.2),
  },

  // MEDIA CARD
  mediaCard: {
    backgroundColor: "white",
    borderRadius: ms(16),
    padding: ms(20),
    margin: ms(20),
    marginTop: ms(12),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: ms(12),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: 2 },
    }),
  },
  previewBox: {
    height: ms(180),
    borderRadius: ms(12),
    borderWidth: ms(1.5),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: ms(20),
    overflow: "hidden",
    position: "relative",
  },
  previewCircle: {
    position: "absolute",
    borderRadius: ms(999),
  },
  previewCircleLarge: {
    width: ms(160),
    height: ms(160),
    top: ms(-40),
    right: ms(-40),
  },
  previewCircleSmall: {
    width: ms(100),
    height: ms(100),
    bottom: ms(-30),
    left: ms(-20),
  },
  previewIconBox: {
    width: ms(64),
    height: ms(64),
    borderRadius: ms(20),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: ms(12),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: ms(10),
        shadowOffset: { width: 0, height: ms(4) },
      },
      android: { elevation: 4 },
    }),
  },
  previewLabel: {
    fontSize: ms(13),
    fontWeight: "600",
  },
  mediaDescription: {
    fontSize: ms(14),
    color: "#64748B",
    lineHeight: ms(22),
    marginBottom: ms(16),
  },
  openButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: ms(14),
    borderRadius: ms(12),
  },
  openButtonText: {
    color: "white",
    fontSize: ms(15),
    fontWeight: "700",
  },

  // COMPLETED BADGE
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(14),
    backgroundColor: "#F0FDF4",
    borderWidth: ms(1),
    borderColor: "#BBF7D0",
    borderRadius: ms(14),
    padding: ms(16),
    marginHorizontal: ms(20),
    marginTop: ms(4),
    marginBottom: ms(20),
  },
  completedIconBox: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(12),
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  completedTitle: {
    fontSize: ms(14),
    fontWeight: "700",
    color: "#065F46",
  },
  completedSub: {
    fontSize: ms(12),
    color: "#059669",
    marginTop: ms(2),
  },

  // FOOTER
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: ms(20),
    paddingTop: ms(12),
    borderTopWidth: ms(1),
    borderTopColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: ms(12),
        shadowOffset: { width: 0, height: ms(-3) },
      },
      android: { elevation: 8 },
    }),
  },
  completeButton: {
    backgroundColor: "#2563EB",
    paddingVertical: ms(15),
    borderRadius: ms(14),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  completeButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  completeButtonText: {
    color: "white",
    fontSize: ms(15),
    fontWeight: "700",
    letterSpacing: ms(0.3),
  },

  // NOT FOUND
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: ms(12),
    backgroundColor: "#F8FAFC",
  },
  notFoundTitle: {
    fontSize: ms(17),
    fontWeight: "700",
    color: "#374151",
  },
  notFoundSub: {
    fontSize: ms(13),
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: ms(40),
  },
});
