import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase";
import { MyLoader } from "@/components/ui/loader";
import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Play,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─────────────────────────────────────────
// 🎨 ICÔNE ET COULEUR SELON LE TYPE
// ─────────────────────────────────────────
const TYPE_CONFIG = {
  text: {
    icon: (color) => <BookOpen size={20} color={color} />,
    label: "Lecture",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  video: {
    icon: (color) => <Play size={20} color={color} />,
    label: "Vidéo",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  pdf: {
    icon: (color) => <FileText size={20} color={color} />,
    label: "Document PDF",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
};

// ─────────────────────────────────────────
// 🧩 COMPOSANT PRINCIPAL
// ─────────────────────────────────────────
export default function LessonDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // ── Paramètres de navigation ──
  // isLearner est passé en string "true"/"false" via router.push params
  const { lessonId, moduleId, formationId, isLearner } = useLocalSearchParams();
  const isLearnerMode = isLearner === "true";

  // ── États locaux ──
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [snack, setSnack] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showSnack = (message, type = "success") =>
    setSnack({ visible: true, message, type });
  const dismissSnack = () => setSnack((prev) => ({ ...prev, visible: false }));

  // ─────────────────────────────────────────
  // 📡 CHARGEMENT DE LA LEÇON
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!formationId || !moduleId || !lessonId) return;

    const lessonRef = doc(
      db,
      "formations",
      formationId,
      "modules",
      moduleId,
      "lessons",
      lessonId,
    );

    // Écoute temps réel de la leçon
    const unsubscribe = onSnapshot(lessonRef, (snap) => {
      if (snap.exists()) {
        setLesson({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [formationId, moduleId, lessonId]);

  // ─────────────────────────────────────────
  // ✅ VÉRIFICATION SI DÉJÀ COMPLÉTÉ (learner)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!isLearnerMode || !user?.uid || !lessonId) return;

    // On écoute userProgress pour savoir si cette leçon est déjà faite
    const q = query(
      collection(db, "userProgress"),
      where("userId", "==", user.uid),
      where("lessonId", "==", lessonId),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIsCompleted(!snapshot.empty);
    });

    return () => unsubscribe();
  }, [isLearnerMode, user?.uid, lessonId]);

  // ─────────────────────────────────────────
  // 🏆 MARQUER COMME TERMINÉ
  // ─────────────────────────────────────────
  const handleComplete = async () => {
    if (isCompleted || !user?.uid) return;

    try {
      setCompleting(true);

      await addDoc(collection(db, "userProgress"), {
        userId: user.uid,
        trainingId: formationId,
        moduleId,
        lessonId,
        completedAt: serverTimestamp(),
      });

      showSnack("Leçon marquée comme terminée ! 🎉", "success");

      // Retour automatique après 1.5s
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      console.error("Erreur completion leçon:", error);
      showSnack("Une erreur est survenue", "error");
    } finally {
      setCompleting(false);
    }
  };

  // ─────────────────────────────────────────
  // 🔗 OUVRIR UN LIEN EXTERNE (video/pdf)
  // ─────────────────────────────────────────
  const handleOpenLink = () => {
    if (lesson?.content) Linking.openURL(lesson.content);
  };

  if (loading) return <MyLoader message="Chargement de la leçon..." />;

  if (!lesson) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text color="muted">Leçon introuvable.</Text>
      </Box>
    );
  }

  const typeConfig = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.text;

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      {/* ─── HEADER ─── */}
      <Box
        backgroundColor="white"
        paddingHorizontal="l"
        paddingBottom="m"
        borderBottomWidth={1}
        borderBottomColor="border"
        style={{ paddingTop: insets.top + 10 }}
      >
        <Box flexDirection="row" alignItems="center" gap="m">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>

          <Box flex={1}>
            {/* Badge type */}
            <Box
              flexDirection="row"
              alignItems="center"
              gap="xs"
              marginBottom="xs"
            >
              <Box
                paddingHorizontal="s"
                paddingVertical="xs"
                borderRadius="s"
                backgroundColor={typeConfig.bg}
                flexDirection="row"
                alignItems="center"
                gap="xs"
              >
                {typeConfig.icon(typeConfig.color)}
                <Text
                  variant="caption"
                  style={{ color: typeConfig.color }}
                  fontWeight="bold"
                >
                  {typeConfig.label}
                </Text>
              </Box>

              {/* Badge durée */}
              {lesson.duration && (
                <Text variant="caption" color="muted">
                  · {lesson.duration} min
                </Text>
              )}
            </Box>

            <Text variant="title" numberOfLines={2}>
              {lesson.title}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* ─── CONTENU ─── */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Type TEXTE : affichage direct ── */}
        {lesson.type === "text" && (
          <Box
            backgroundColor="white"
            borderRadius="xl"
            padding="l"
            style={styles.card}
          >
            <Text variant="body" style={{ lineHeight: 26 }} color="text">
              {lesson.content}
            </Text>
          </Box>
        )}

        {/* ── Type VIDÉO : bouton d'ouverture ── */}
        {lesson.type === "video" && (
          <Box
            backgroundColor="white"
            borderRadius="xl"
            padding="l"
            alignItems="center"
            style={styles.card}
          >
            {/* Thumbnail simulé */}
            <Box
              width="100%"
              height={180}
              backgroundColor="#FEF2F2"
              borderRadius="l"
              justifyContent="center"
              alignItems="center"
              marginBottom="l"
            >
              <Box
                width={64}
                height={64}
                borderRadius="rounded"
                backgroundColor="#EF4444"
                justifyContent="center"
                alignItems="center"
              >
                <Play size={30} color="white" />
              </Box>
            </Box>

            <Text
              variant="body"
              color="muted"
              textAlign="center"
              marginBottom="l"
            >
              Appuyez sur le bouton pour ouvrir la vidéo dans votre navigateur.
            </Text>

            <TouchableOpacity
              onPress={handleOpenLink}
              style={styles.linkButton}
            >
              <Play size={18} color="white" />
              <Text color="white" fontWeight="bold" marginLeft="s">
                Regarder la vidéo
              </Text>
            </TouchableOpacity>
          </Box>
        )}

        {/* ── Type PDF : bouton d'ouverture ── */}
        {lesson.type === "pdf" && (
          <Box
            backgroundColor="white"
            borderRadius="xl"
            padding="l"
            alignItems="center"
            style={styles.card}
          >
            <Box
              width={80}
              height={80}
              borderRadius="l"
              backgroundColor="#FFFBEB"
              justifyContent="center"
              alignItems="center"
              marginBottom="l"
            >
              <FileText size={40} color="#F59E0B" />
            </Box>

            <Text variant="body" fontWeight="bold" marginBottom="s">
              Document PDF
            </Text>
            <Text
              variant="body"
              color="muted"
              textAlign="center"
              marginBottom="l"
            >
              Appuyez sur le bouton pour ouvrir le document.
            </Text>

            <TouchableOpacity
              onPress={handleOpenLink}
              style={[styles.linkButton, { backgroundColor: "#F59E0B" }]}
            >
              <FileText size={18} color="white" />
              <Text color="white" fontWeight="bold" marginLeft="s">
                Ouvrir le PDF
              </Text>
            </TouchableOpacity>
          </Box>
        )}

        {/* ── Badge "Déjà complété" ── */}
        {isLearnerMode && isCompleted && (
          <Box
            flexDirection="row"
            alignItems="center"
            gap="s"
            backgroundColor="#D1FAE5"
            padding="m"
            borderRadius="l"
            marginTop="l"
          >
            <CheckCircle2 size={20} color="#10B981" />
            <Text style={{ color: "#065F46" }} fontWeight="bold">
              Leçon déjà complétée
            </Text>
          </Box>
        )}

        {/* ── Badge "Mode prévisualisation" pour trainer ── */}
        {!isLearnerMode && (
          <Box
            backgroundColor="#F3F4F6"
            padding="m"
            borderRadius="l"
            marginTop="l"
          >
            <Text variant="caption" color="muted" textAlign="center">
              👁️ Mode prévisualisation — Vue identique à celle de
              l&apos;apprenant
            </Text>
          </Box>
        )}
      </ScrollView>

      {/* ─── BOUTON TERMINER (learner uniquement) ─── */}
      {isLearnerMode && !isCompleted && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          backgroundColor="white"
          padding="m"
          borderTopWidth={1}
          borderTopColor="border"
          style={{ paddingBottom: insets.bottom + 10 }}
        >
          <Button
            title="Marquer comme terminé"
            variant="primary"
            onPress={handleComplete}
            loading={completing}
            disabled={completing}
            icon={<CheckCircle2 size={20} color="white" />}
            iconPosition="right"
          />
        </Box>
      )}

      {/* ─── SNACK ─── */}
      <Snack
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={dismissSnack}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  linkButton: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
