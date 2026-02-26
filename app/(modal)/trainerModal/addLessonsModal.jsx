import { Box, Button, Text } from "@/components/ui/theme";
import { InputField } from "@/hooks/auth/inputField";
import { yupResolver } from "@hookform/resolvers/yup";
import { Clock, FileText, Upload, X } from "lucide-react-native";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Modal, Portal } from "react-native-paper";
import {
  LESSON_TYPES,
  lessonSchema,
} from "../../../components/validators/validate.lesson";

/**
 * Modal de création/édition d'une leçon.
 * La logique d'upload PDF est dans useLessons → pickAndUploadPDF
 *
 * @param {boolean}   visible
 * @param {function}  onClose
 * @param {function}  onSubmit       ← addLesson ou updateLesson depuis useLessons
 * @param {function}  onPickPDF      ← pickAndUploadPDF depuis useLessons
 * @param {boolean}   loading        ← actionLoading
 * @param {boolean}   uploadingPDF   ← uploadingPDF depuis useLessons
 * @param {Object}    lesson         ← null = création, objet = édition
 */
export function AddLessonModal({
  visible,
  onClose,
  onSubmit,
  onPickPDF,
  loading,
  uploadingPDF,
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
    defaultValues: { title: "", type: "text", content: "", duration: null },
  });

  const selectedType = watch("type");
  const content = watch("content");

  // ── Pré-remplissage édition ──
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

  // Reset content quand on change de type
  useEffect(() => {
    setValue("content", "");
  }, [selectedType]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  // ── Nom du PDF affiché (extrait de l'URL Cloudinary) ──
  const pdfUploaded = selectedType === "pdf" && !!content;
  const pdfDisplayName = pdfUploaded
    ? decodeURIComponent(content.split("/").pop())
    : null;

  const isSubmitDisabled =
    loading ||
    uploadingPDF ||
    (selectedType === "pdf" && !pdfUploaded && !isEditing);

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

                {/* ── TEXTE ── */}
                {selectedType === "text" && (
                  <>
                    <Text variant="caption" color="muted" marginBottom="xs">
                      Contenu
                    </Text>
                    <InputField
                      control={control}
                      name="content"
                      placeholder="Rédigez le contenu de la leçon..."
                      multiline
                      numberOfLines={5}
                      error={errors.content?.message}
                    />
                  </>
                )}

                {/* ── VIDÉO → lien YouTube/Vimeo ── */}
                {selectedType === "video" && (
                  <>
                    <Text variant="caption" color="muted" marginBottom="xs">
                      Lien YouTube ou Vimeo
                    </Text>
                    <InputField
                      control={control}
                      name="content"
                      placeholder="https://youtube.com/watch?v=..."
                      keyboardType="url"
                      autoCapitalize="none"
                      error={errors.content?.message}
                    />
                    <Box
                      backgroundColor="secondaryBackground"
                      padding="s"
                      borderRadius="m"
                      marginTop="s"
                    >
                      <Text variant="caption" color="muted">
                        💡 Uploadez sur YouTube en "Non listé" puis collez le
                        lien ici
                      </Text>
                    </Box>
                  </>
                )}

                {/* ── PDF → upload via hook ── */}
                {selectedType === "pdf" && (
                  <>
                    <Text variant="caption" color="muted" marginBottom="s">
                      Fichier PDF
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={uploadingPDF}
                      onPress={async () => {
                        const result = await onPickPDF();
                        if (result?.url) setValue("content", result.url);
                      }}
                    >
                      <Box
                        borderWidth={2}
                        borderColor={pdfUploaded ? "primary" : "border"}
                        borderStyle="dashed"
                        borderRadius="l"
                        padding="l"
                        alignItems="center"
                        gap="s"
                        backgroundColor={
                          pdfUploaded ? "successLight" : "secondaryBackground"
                        }
                      >
                        {uploadingPDF ? (
                          <>
                            <ActivityIndicator color="#2563EB" />
                            <Text variant="caption" color="primary">
                              Upload en cours...
                            </Text>
                          </>
                        ) : pdfUploaded ? (
                          <>
                            <FileText size={28} color="#2563EB" />
                            <Text
                              variant="caption"
                              color="primary"
                              fontWeight="bold"
                              numberOfLines={1}
                            >
                              {pdfDisplayName}
                            </Text>
                            <Text variant="caption" color="muted">
                              Appuyez pour changer
                            </Text>
                          </>
                        ) : (
                          <>
                            <Upload size={28} color="#6B7280" />
                            <Text
                              variant="caption"
                              color="muted"
                              fontWeight="bold"
                            >
                              Choisir un fichier PDF
                            </Text>
                            <Text variant="caption" color="muted">
                              Appuyez pour parcourir
                            </Text>
                          </>
                        )}
                      </Box>
                    </TouchableOpacity>
                  </>
                )}

                {/* ── Durée ── */}
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

                {/* ── Soumettre ── */}
                <Button
                  title={
                    isEditing
                      ? "Enregistrer les modifications"
                      : "Ajouter la leçon"
                  }
                  onPress={handleSubmit(handleFormSubmit)}
                  loading={loading || uploadingPDF}
                  disabled={isSubmitDisabled}
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
