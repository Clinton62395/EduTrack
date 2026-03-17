import { Box, Button, Text } from "@/components/ui/theme";
import { LayoutPanelLeft, Plus, Save, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Modal, Portal } from "react-native-paper";

const DEFAULT_PASSING_SCORE = 70;
const MIN_PASSING_SCORE = 50;
const MAX_PASSING_SCORE = 95;

export default function AddModuleModal({
  visible,
  onClose,
  onSubmit,
  loading,
  module = null,
}) {
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const isEdit = useMemo(() => !!module, [module]);

  useEffect(() => {
    if (visible) {
      setTitle(module?.title || "");
      // ✅ Pré-rempli si déjà défini, sinon vide (placeholder montrera 70%)
      setPassingScore(module?.passingScore ? String(module.passingScore) : "");
    }
  }, [visible, module]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isTitleValid = title.trim().length >= 3;

  // ✅ Validation du score — optionnel mais si rempli doit être dans la fourchette
  const scoreValue = passingScore === "" ? null : parseInt(passingScore);
  const isScoreValid =
    scoreValue === null ||
    (!isNaN(scoreValue) &&
      scoreValue >= MIN_PASSING_SCORE &&
      scoreValue <= MAX_PASSING_SCORE);

  const isFormValid = isTitleValid && isScoreValid;

  const handleSubmit = () => {
    if (!isFormValid || loading) return;

    onSubmit({
      id: module?.id || null,
      title: title.trim(),
      // ✅ Si vide → 70% par défaut, sinon valeur saisie
      passingScore: scoreValue ?? DEFAULT_PASSING_SCORE,
    });
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={{
          backgroundColor: "white",
          marginHorizontal: 20,
          marginBottom: keyboardHeight > 0 ? keyboardHeight : 20,
          borderRadius: 28,
          padding: 24,
          elevation: 5,
          maxHeight: "80%",
        }}
      >
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="l"
          >
            <Box flexDirection="row" alignItems="center" gap="s">
              <LayoutPanelLeft size={22} color="#2563EB" />
              <Text variant="title">
                {isEdit ? "Modifier le module" : "Nouveau module"}
              </Text>
            </Box>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </Box>

          {/* ── TITRE ── */}
          <Text variant="body" color="textSecondary" marginBottom="s">
            Titre du module
          </Text>
          <Box
            backgroundColor="secondaryBackground"
            borderRadius="m"
            paddingHorizontal="m"
            paddingVertical="s"
            marginBottom="s"
            borderWidth={1}
            borderColor={
              isTitleValid || title.length === 0 ? "border" : "danger"
            }
          >
            <TextInput
              placeholder="Ex: Introduction au React Native"
              value={title}
              onChangeText={setTitle}
              autoFocus
              style={{ fontSize: 16, height: 40 }}
            />
          </Box>
          {!isTitleValid && title.length > 0 && (
            <Text variant="caption" color="danger" marginBottom="s">
              Le titre doit contenir au moins 3 caractères
            </Text>
          )}

          {/* ── SCORE MINIMUM ── */}
          <Box marginTop="m" marginBottom="s">
            <Box
              flexDirection="row"
              alignItems="center"
              gap="s"
              marginBottom="xs"
            >
              <Text variant="body" color="textSecondary">
                Score minimum du quiz
              </Text>
              <Box
                backgroundColor="infoBackground"
                paddingHorizontal="s"
                paddingVertical="xs"
                borderRadius="s"
              >
                <Text variant="caption" color="primary" fontWeight="600">
                  Optionnel
                </Text>
              </Box>
            </Box>
            <Text variant="caption" color="muted" marginBottom="s">
              Entre {MIN_PASSING_SCORE}% et {MAX_PASSING_SCORE}%. Par défaut :{" "}
              {DEFAULT_PASSING_SCORE}%
            </Text>
          </Box>

          <Box
            backgroundColor="secondaryBackground"
            borderRadius="m"
            paddingHorizontal="m"
            paddingVertical="s"
            marginBottom="s"
            borderWidth={1}
            borderColor={
              !isScoreValid
                ? "danger"
                : passingScore.length > 0
                  ? "primary"
                  : "border"
            }
            flexDirection="row"
            alignItems="center"
          >
            <TextInput
              placeholder={`${DEFAULT_PASSING_SCORE}`}
              value={passingScore}
              onChangeText={(v) => {
                // Accepte uniquement les chiffres
                if (/^\d*$/.test(v)) setPassingScore(v);
              }}
              keyboardType="number-pad"
              maxLength={2}
              style={{ fontSize: 16, height: 40, flex: 1 }}
            />
            <Text variant="body" color="muted" fontWeight="600">
              %
            </Text>
          </Box>

          {!isScoreValid && passingScore.length > 0 && (
            <Text variant="caption" color="danger" marginBottom="s">
              Le score doit être entre {MIN_PASSING_SCORE}% et{" "}
              {MAX_PASSING_SCORE}%
            </Text>
          )}

          {/* ACTIONS */}
          <Box
            flexDirection="row"
            gap="m"
            marginTop="l"
            justifyContent="center"
          >
            <Box flex={0.8}>
              <Button title="Annuler" onPress={onClose} variant="outline" />
            </Box>
            <Box flex={1}>
              <Button
                title={loading ? "Envoi..." : isEdit ? "Enregistrer" : "Créer"}
                disabled={!isFormValid || loading}
                onPress={handleSubmit}
                variant="primary"
                icon={
                  isEdit ? (
                    <Save size={18} color="white" />
                  ) : (
                    <Plus size={18} color="white" />
                  )
                }
              />
            </Box>
          </Box>
        </ScrollView>
      </Modal>
    </Portal>
  );
}
