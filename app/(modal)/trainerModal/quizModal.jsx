import { Box, Button, Text } from "@/components/ui/theme";
import { InputField } from "@/hooks/auth/inputField";
import { yupResolver } from "@hookform/resolvers/yup";
import { CheckCircle2, X } from "lucide-react-native";
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
// 📋 VALIDATION
// ─────────────────────────────────────────
const questionSchema = yup.object({
  question: yup.string().required("La question est requise"),
  options: yup
    .array()
    .of(yup.string().required("L'option ne peut pas être vide"))
    .min(2, "Au moins 2 options requises"),
  correctIndex: yup.number().required(),
  points: yup.number().min(1).default(1),
});

/**
 * Modal de création ou d'édition d'une question de quiz.
 *
 * @param {boolean} visible
 * @param {function} onClose
 * @param {function} onSubmit - reçoit les données validées
 * @param {boolean} loading
 * @param {Object|null} question - null = création, objet = édition
 */
export default function AddQuestionModal({
  visible,
  onClose,
  onSubmit,
  loading,
  question,
}) {
  const isEditing = !!question;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(questionSchema),
    defaultValues: {
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      points: 1,
    },
  });

  const selectedCorrect = watch("correctIndex");
  const options = watch("options");

  // ── Pré-remplissage en mode édition ──
  useEffect(() => {
    if (question) {
      reset({
        question: question.question || "",
        options: question.options?.length ? question.options : ["", "", "", ""],
        correctIndex: question.correctIndex ?? 0,
        points: question.points || 1,
      });
    } else {
      reset({
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        points: 1,
      });
    }
  }, [question, visible]);

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
                    {isEditing ? "Modifier la question" : "Nouvelle question"}
                  </Text>
                  <TouchableOpacity onPress={handleClose}>
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </Box>

                {/* ── Texte de la question ── */}
                <Text variant="caption" color="muted" marginBottom="xs">
                  Question
                </Text>
                <InputField
                  control={control}
                  name="question"
                  placeholder="Ex: Quelle est la capitale de la France ?"
                  multiline
                  numberOfLines={3}
                  error={errors.question?.message}
                />

                {/* ── Options de réponse ── */}
                <Text
                  variant="caption"
                  color="muted"
                  marginTop="m"
                  marginBottom="s"
                >
                  Options de réponse — appuyez sur ✓ pour marquer la bonne
                  réponse
                </Text>

                {[0, 1, 2, 3].map((index) => {
                  const isCorrect = selectedCorrect === index;
                  return (
                    <Box
                      key={index}
                      flexDirection="row"
                      alignItems="center"
                      gap="s"
                      marginBottom="s"
                    >
                      {/* Bouton sélection bonne réponse */}
                      <TouchableOpacity
                        onPress={() => setValue("correctIndex", index)}
                        hitSlop={10}
                      >
                        <Box
                          width={32}
                          height={32}
                          borderRadius="rounded"
                          borderWidth={2}
                          borderColor={isCorrect ? "primary" : "border"}
                          backgroundColor={isCorrect ? "primary" : "white"}
                          justifyContent="center"
                          alignItems="center"
                        >
                          {isCorrect && (
                            <CheckCircle2 size={18} color="white" />
                          )}
                        </Box>
                      </TouchableOpacity>

                      {/* Champ texte de l'option */}
                      <Box flex={1}>
                        <InputField
                          control={control}
                          name={`options.${index}`}
                          placeholder={`Option ${index + 1}`}
                          error={errors.options?.[index]?.message}
                        />
                      </Box>
                    </Box>
                  );
                })}

                {/* ── Points ── */}
                <Text
                  variant="caption"
                  color="muted"
                  marginTop="m"
                  marginBottom="xs"
                >
                  Points pour cette question
                </Text>
                <InputField
                  control={control}
                  name="points"
                  placeholder="1"
                  keyboardType="number-pad"
                />

                {/* ── Bouton soumission ── */}
                <Button
                  title={isEditing ? "Enregistrer" : "Ajouter la question"}
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
