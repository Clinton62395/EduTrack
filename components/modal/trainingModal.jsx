import { Box, Button, Text } from "@/components/ui/theme";
import { InputField } from "@/hooks/auth/inputField";
import { SelectField } from "@/hooks/auth/selectField";
import { BookOpen, Calendar, Hash, Users, X } from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  formationCategories,
  formationStatuses,
} from "../features/trainerProfile/trainerDataMock";

export function CreateFormationModal({ visible, onClose, onCreate }) {
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // Initialisation de React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      status: "planned",
      startDate: "",
      endDate: "",
      schedule: "",
      maxLearners: "20",
      modules: "8",
    },
  });

  const generateInvitationCode = () => {
    const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formationData = {
        ...data,
        invitationCode: generateInvitationCode(),
        currentLearners: 0,
        attendanceRate: 0,
        progressionRate: 0,
        completedModules: 0,
        color: "#2563EB",
        createdAt: new Date().toISOString(),
      };

      if (onCreate) {
        await onCreate(formationData);
      }

      Alert.alert(
        "Succès !",
        `Formation créée avec succès !\nCode d'invitation : ${formationData.invitationCode}`,
        [
          {
            text: "OK",
            onPress: () => {
              reset();
              onClose();
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer la formation");
    } finally {
      setLoading(false);
    }
  };
  // Fonction pour parser la date

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Box
          flex={1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          justifyContent="flex-end"
        >
          <Box
            backgroundColor="white"
            borderTopLeftRadius="xl"
            borderTopRightRadius="xl"
            height="92%"
          >
            {/* Header */}
            <Box
              padding="l"
              borderBottomWidth={1}
              borderBottomColor="border"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text variant="title">Nouvelle formation</Text>
              <TouchableOpacity onPress={onClose} hitSlop={20}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </Box>

            {/* Formulaire */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Box gap="m">
                {/* Titre avec validation obligatoire */}
                <InputField
                  control={control}
                  name="title"
                  label="Titre de la formation *"
                  placeholder="Ex: React Native Avancé"
                  error={errors.title}
                  rules={{ required: "Le titre est requis" }}
                  icon={<BookOpen size={18} color="#6B7280" />}
                />

                <InputField
                  control={control}
                  name="description"
                  label="Description"
                  placeholder="Décrivez votre formation..."
                  error={errors.description}
                  multiline
                  numberOfLines={3}
                />

                <SelectField
                  control={control}
                  name="category"
                  label="Catégorie *"
                  options={formationCategories}
                  error={errors.category}
                  rules={{ required: "Veuillez choisir une catégorie" }}
                />

                <SelectField
                  control={control}
                  name="status"
                  label="Statut"
                  options={formationStatuses}
                  error={errors.status}
                />

                <Box flexDirection="row" gap="m">
                  <Box flex={1}>
                    <InputField
                      control={control}
                      name="startDate"
                      label="Date de début"
                      placeholder="JJ/MM/AAAA"
                      error={errors.startDate}
                      icon={<Calendar size={18} color="#6B7280" />}
                      rules={{
                        required: "Requis",
                        pattern: {
                          value: /^\d{2}\/\d{2}\/\d{4}$/,
                          message: "Format JJ/MM/AAAA",
                        },
                      }}
                    />
                  </Box>
                  <Box flex={1}>
                    <InputField
                      control={control}
                      name="endDate"
                      label="Date de fin"
                      placeholder="JJ/MM/AAAA"
                      error={errors.endDate}
                      icon={<Calendar size={18} color="#6B7280" />}
                      rules={{
                        required: "Requis",
                        validate: (value, formValues) => {
                          // Logique pour comparer les dates
                          if (!formValues.startDate) return true;

                          const start = parseDate(formValues.startDate);
                          const end = parseDate(value);

                          return (
                            end >= start || "La fin doit être après le début"
                          );
                        },
                      }}
                    />
                  </Box>
                </Box>

                <InputField
                  control={control}
                  name="schedule"
                  label="Horaires"
                  placeholder="Ex: Lundi 18h-20h"
                  error={errors.schedule}
                  icon={<Calendar size={18} color="#6B7280" />}
                />

                <Box flexDirection="row" gap="m">
                  <Box flex={1}>
                    <InputField
                      control={control}
                      name="maxLearners"
                      label="Nombre max"
                      keyboardType="numeric"
                      error={errors.maxLearners}
                      icon={<Users size={18} color="#6B7280" />}
                    />
                  </Box>
                  <Box flex={1}>
                    <InputField
                      control={control}
                      name="modules"
                      label="Modules"
                      keyboardType="numeric"
                      error={errors.modules}
                      icon={<Hash size={18} color="#6B7280" />}
                    />
                  </Box>
                </Box>
              </Box>
            </ScrollView>

            {/* Actions */}
            <Box
              padding="m"
              borderTopWidth={1}
              borderTopColor="border"
              alignItems="center"
              backgroundColor="white"
              style={{ paddingBottom: insets.bottom + 16 }}
            >
              <Box flexDirection="row" gap="m">
                <Button
                  onPress={onClose}
                  title="Annuler"
                  variant="overlayDark"
                  color="overlayDark"
                  backgroundColor="danger"
                />

                <Button
                  onPress={onSubmit}
                  variant="secondary"
                  title={loading ? "Création..." : "Créer la formation"}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </KeyboardAvoidingView>
    </Modal>
  );
}
