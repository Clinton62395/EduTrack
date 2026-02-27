import { Box, Button, Text } from "@/components/ui/theme";
import { InputField } from "@/hooks/auth/inputField";
import { yupResolver } from "@hookform/resolvers/yup";
import { FileText, Link, Play, X } from "lucide-react-native";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Modal, Portal } from "react-native-paper";
import * as yup from "yup";

// ─────────────────────────────────────────
// 📋 VALIDATION
// ─────────────────────────────────────────
const resourceSchema = yup.object({
  name: yup.string().required("Le nom est requis"),
  type: yup.string().oneOf(["pdf", "video", "link"]).required(),
  url: yup.string().url("L'URL n'est pas valide").required("L'URL est requise"),
});

// ─────────────────────────────────────────
// 🎨 TYPES DE RESSOURCES
// ─────────────────────────────────────────
const RESOURCE_TYPES = [
  {
    value: "pdf",
    label: "PDF",
    icon: <FileText size={18} color="#F59E0B" />,
  },
  {
    value: "video",
    label: "Vidéo",
    icon: <Play size={18} color="#EF4444" />,
  },
  {
    value: "link",
    label: "Lien",
    icon: <Link size={18} color="#2563EB" />,
  },
];

/**
 * Modal d'ajout d'une ressource à une formation.
 *
 * @param {boolean} visible
 * @param {function} onClose
 * @param {function} onSubmit
 * @param {boolean} loading
 */
export default function AddResourceModal({ visible, onClose, onSubmit, loading }) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resourceSchema),
    defaultValues: { name: "", type: "pdf", url: "" },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (!visible) reset();
  }, [visible]);

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
              {/* ── En-tête ── */}
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="l"
              >
                <Text variant="title">Ajouter une ressource</Text>
                <TouchableOpacity onPress={handleClose}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </Box>

              {/* ── Nom ── */}
              <Text variant="caption" color="muted" marginBottom="xs">
                Nom du fichier
              </Text>
              <InputField
                control={control}
                name="name"
                placeholder="Ex: Fiche de révision chapitre 1"
                error={errors.name?.message}
              />

              {/* ── Type ── */}
              <Text
                variant="caption"
                color="muted"
                marginTop="m"
                marginBottom="s"
              >
                Type
              </Text>
              <Box flexDirection="row" gap="s" marginBottom="m">
                {RESOURCE_TYPES.map((type) => {
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
                        backgroundColor={isSelected ? "cardBackground" : "white"}
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

              {/* ── URL ── */}
              <Text variant="caption" color="muted" marginBottom="xs">
                URL du fichier
              </Text>
              <InputField
                control={control}
                name="url"
                placeholder="https://..."
                keyboardType="url"
                autoCapitalize="none"
                error={errors.url?.message}
              />

              {/* ── Bouton ── */}
              <Button
                title="Ajouter la ressource"
                onPress={handleSubmit(handleFormSubmit)}
                loading={loading}
                disabled={loading}
                marginTop="xl"
                variant="primary"
              />
            </Box>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </Portal>
  );
}
