import { Box, Button, Text } from "@/components/ui/theme";
import { InputField } from "@/hooks/auth/inputField";
import { yupResolver } from "@hookform/resolvers/yup";
import { BookOpen, Clock, FileText, Play, X } from "lucide-react-native";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Modal, Portal } from "react-native-paper";
import * as yup from "yup";

// ─────────────────────────────────────────
// 📋 SCHÉMA DE VALIDATION
// ─────────────────────────────────────────
const lessonSchema = yup.object({
  title: yup.string().required("Le titre est requis"),
  type: yup
    .string()
    .oneOf(["text", "video", "pdf", "quiz"])
    .required("Le type est requis"),
  content: yup.string().required("Le contenu est requis"),
  duration: yup
    .number()
    .nullable()
    .transform((v) => (isNaN(v) ? null : v)),
});

// ─────────────────────────────────────────
// 🎨 TYPES DE LEÇONS DISPONIBLES
// ─────────────────────────────────────────
const LESSON_TYPES = [
  {
    value: "text",
    label: "Texte",
    icon: <BookOpen size={18} color="#2563EB" />,
    placeholder: "Écrivez le contenu de la leçon...",
  },
  {
    value: "video",
    label: "Vidéo",
    icon: <Play size={18} color="#EF4444" />,
    placeholder: "URL de la vidéo (YouTube, Loom...)",
  },
  {
    value: "pdf",
    label: "PDF",
    icon: <FileText size={18} color="#F59E0B" />,
    placeholder: "URL du fichier PDF",
  },
];

// ─────────────────────────────────────────
// 🧩 COMPOSANT PRINCIPAL
// ─────────────────────────────────────────
/**
 * Modal de création ou d'édition d'une leçon.
 *
 * @param {boolean} visible - Affichage du modal
 * @param {function} onClose - Fermeture du modal
 * @param {function} onSubmit - Soumission (reçoit les données du form)
 * @param {boolean} loading - État de chargement pendant la soumission
 * @param {Object|null} lesson - Leçon existante (null = mode création)
 */
export function AddLessonModal({
  visible,
  onClose,
  onSubmit,
  loading,
  lesson,
}) {
  const isEditing = !!lesson;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(lessonSchema),
    defaultValues: {
      title: "",
      type: "text",
      content: "",
      duration: null,
    },
  });

  // Type sélectionné pour adapter le placeholder du champ content
  const selectedType = watch("type");
  const currentType = LESSON_TYPES.find((t) => t.value === selectedType);

  // ── Pré-remplissage en mode édition ──
  useEffect(() => {
    if (lesson) {
      reset({
        title: lesson.title || "",
        type: lesson.type || "text",
        content: lesson.content || "",
        duration: lesson.duration || null,
      });
    } else {
      reset({ title: "", type: "text", content: "", duration: null });
    }
  }, [lesson, visible]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={{ margin: 20 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <Box
              backgroundColor="white"
              borderRadius="xl"
              padding="l"
              style={{
                elevation: 6,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 20,
              }}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* ── En-tête ── */}
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom="l"
                >
                  <Text variant="title">
                    {isEditing ? "Modifier la leçon" : "Nouvelle leçon"}
                  </Text>
                  <TouchableOpacity onPress={handleClose}>
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </Box>

                {/* ── Titre ── */}
                <Text variant="caption" color="muted" marginBottom="xs">
                  Titre de la leçon
                </Text>
                <InputField
                  control={control}
                  name="title"
                  placeholder="Ex: Introduction aux bases..."
                  error={errors.title?.message}
                />

                {/* ── Sélecteur de type ── */}
                <Text
                  variant="caption"
                  color="muted"
                  marginTop="m"
                  marginBottom="s"
                >
                  Type de contenu
                </Text>
                <Box flexDirection="row" gap="s" marginBottom="m">
                  {LESSON_TYPES.map((type) => {
                    const isSelected = selectedType === type.value;
                    return (
                      <TouchableOpacity
                        key={type.value}
                        onPress={() => setValue("type", type.value)}
                        style={{ flex: 1 }}
                      >
                        <Box
                          padding="s"
                          borderRadius="m"
                          borderWidth={2}
                          borderColor={isSelected ? "primary" : "border"}
                          backgroundColor={
                            isSelected ? "cardBackground" : "white"
                          }
                          alignItems="center"
                          gap="xs"
                        >
                          {type.icon}
                          <Text
                            variant="caption"
                            color={isSelected ? "primary" : "muted"}
                            fontWeight={isSelected ? "bold" : "normal"}
                          >
                            {type.label}
                          </Text>
                        </Box>
                      </TouchableOpacity>
                    );
                  })}
                </Box>

                {/* ── Contenu (adapté selon le type) ── */}
                <Text variant="caption" color="muted" marginBottom="xs">
                  {selectedType === "text" ? "Contenu" : "URL"}
                </Text>
                <InputField
                  control={control}
                  name="content"
                  placeholder={currentType?.placeholder || "Contenu..."}
                  multiline={selectedType === "text"}
                  numberOfLines={selectedType === "text" ? 5 : 1}
                  error={errors.content?.message}
                />

                {/* ── Durée estimée ── */}
                <Text
                  variant="caption"
                  color="muted"
                  marginTop="m"
                  marginBottom="xs"
                >
                  Durée estimée (minutes) — optionnel
                </Text>
                <InputField
                  control={control}
                  name="duration"
                  placeholder="Ex: 15"
                  keyboardType="number-pad"
                  icon={<Clock size={18} color="#6B7280" />}
                />

                {/* ── Bouton de soumission ── */}
                <Button
                  title={
                    isEditing
                      ? "Enregistrer les modifications"
                      : "Ajouter la leçon"
                  }
                  onPress={handleSubmit(handleFormSubmit)}
                  loading={loading}
                  disabled={loading}
                  marginTop="xl"
                  variant="primary"
                />
              </ScrollView>
            </Box>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </Portal>
  );
}
