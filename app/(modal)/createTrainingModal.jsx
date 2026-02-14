import * as ImagePicker from "expo-image-picker";
import {
  BookOpen,
  Camera,
  Hash,
  Image as ImageIcon,
  Save,
  Ticket,
  Upload,
  Users,
  X,
} from "lucide-react-native";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import { Image, ScrollView, TouchableOpacity } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Box, Button, Text } from "@/components/ui/theme";
import { InputField } from "@/hooks/auth/inputField";
import { SelectField } from "@/hooks/auth/selectField";
import { useCreateTraining } from "@/hooks/useCreateTraining";
import { formationCategories } from "../../components/features/trainerProfile/trainerDataMock";
import { DateField } from "../../components/helpers/DatePicker";
import { useCreateOrUpdateTraining } from "../../hooks/useCreateTraining";

export function CreateTrainingModal({
  visible,
  onClose,
  onCreate,
  initialData = null, // Prop pour le mode "Update"
}) {
  const insets = useSafeAreaInsets();
  const isEdit = !!initialData;

  const {
    control,
    errors,
    handleSubmit,
    onSubmit,
    loading,
    coverImage,
    setCoverImage,
    setValue,
    reset,
  } = useCreateOrUpdateTraining(onCreate, onClose);

  // --- LOGIQUE DE REMPLISSAGE (Mode Edit) ---
  useEffect(() => {
    if (visible && initialData) {
      // On remplit react-hook-form avec les données existantes
      Object.keys(initialData).forEach((key) => {
        setValue(key, initialData[key]);
      });
      if (initialData.coverImage) setCoverImage(initialData.coverImage);
    } else if (visible && !initialData) {
      reset(); // On vide si c'est une nouvelle création
      setCoverImage(null);
    }
  }, [visible, initialData]);

  // --- LOGIQUE IMAGE ---
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled) setCoverImage(result.assets[0].uri);
  };

  const category = useWatch({ control, name: "category" });
  const startDate = useWatch({ control, name: "startDate" });

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={{
          backgroundColor: "white",
          marginHorizontal: 10,
          marginTop: insets.top,
          marginBottom: 10,
          borderRadius: 32,
          overflow: "hidden",
          height: "90%", // On garde une grande taille pour le formulaire
        }}
      >
        {/* HEADER FIXED */}
        <Box
          padding="l"
          borderBottomWidth={1}
          borderBottomColor="border"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box flexDirection="row" alignItems="center" gap="s">
            <Text variant="title" fontSize={20}>
              {isEdit ? "Modifier la formation" : "Nouvelle formation"}
            </Text>
          </Box>
          <TouchableOpacity onPress={onClose} hitSlop={20}>
            <Box
              backgroundColor="secondaryBackground"
              padding="s"
              borderRadius="rounded"
            >
              <X size={20} color="#6B7280" />
            </Box>
          </TouchableOpacity>
        </Box>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        >
          <Box gap="m">
            {/* IMAGE PICKER PREMIUM */}
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              <Box
                height={180}
                backgroundColor="secondaryBackground"
                borderRadius="xl"
                borderStyle="dashed"
                borderWidth={2}
                borderColor={coverImage ? "transparent" : "primary"}
                justifyContent="center"
                alignItems="center"
                overflow="hidden"
              >
                {coverImage ? (
                  <Box width="100%" height="100%">
                    <Image
                      source={{ uri: coverImage }}
                      style={{ width: "100%", height: "100%" }}
                    />
                    <Box
                      position="absolute"
                      bottom={12}
                      right={12}
                      backgroundColor="white"
                      padding="s"
                      borderRadius="m"
                      elevation={4}
                    >
                      <Camera size={18} color="black" />
                    </Box>
                  </Box>
                ) : (
                  <Box alignItems="center">
                    <ImageIcon size={40} color="#2563EB" />
                    <Text variant="caption" marginTop="s" fontWeight="600">
                      Ajouter une bannière
                    </Text>
                  </Box>
                )}
              </Box>
            </TouchableOpacity>

            {/* FORM FIELDS */}
            <InputField
              control={control}
              name="title"
              label="Titre de la formation *"
              placeholder="Ex: Expert React Native"
              error={errors.title}
              icon={<BookOpen size={18} color="#6B7280" />}
            />

            <InputField
              control={control}
              name="description"
              label="Description"
              placeholder="Objectifs de la formation..."
              error={errors.description}
              multiline
              numberOfLines={4}
            />

            <SelectField
              control={control}
              name="category"
              label="Domaine d'expertise *"
              options={formationCategories}
              error={errors.category}
            />

            {category === "other" && (
              <InputField
                control={control}
                name="customCategory"
                label="Précisez la catégorie *"
                placeholder="Ex : Architecture Cloud"
                error={errors.customCategory}
                icon={<Ticket size={18} color="#6B7280" />}
              />
            )}

            <Box flexDirection="row" gap="m">
              <Box flex={1}>
                <DateField
                  control={control}
                  name="startDate"
                  label="Début"
                  error={errors.startDate}
                />
              </Box>
              <Box flex={1}>
                <DateField
                  control={control}
                  name="endDate"
                  label="Fin"
                  minimumDate={startDate}
                  error={errors.endDate}
                />
              </Box>
            </Box>

            <Box flexDirection="row" gap="m">
              <Box flex={1}>
                <InputField
                  control={control}
                  name="maxLearners"
                  label="Capacité max"
                  keyboardType="numeric"
                  error={errors.maxLearners}
                  icon={<Users size={18} color="#6B7280" />}
                />
              </Box>
              <Box flex={1}>
                <InputField
                  control={control}
                  name="price"
                  label="Tarif (GNF)"
                  keyboardType="numeric"
                  error={errors.price}
                  icon={<Hash size={18} color="#6B7280" />}
                />
              </Box>
            </Box>
          </Box>
        </ScrollView>

        {/* FOOTER ACTIONS FIXED */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          padding="l"
          backgroundColor="white"
          flexDirection="row"
          justifyContent="center"
          gap="m"
          borderTopWidth={1}
          borderTopColor="border"
        >
          <Button
            title="Annuler"
            onPress={onClose}
            variant="outline"
            flex={1}
          />

          <Button
            title={loading ? "Action..." : isEdit ? "Mettre à jour" : "Publier"}
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            disabled={loading}
            flex={1}
            icon={
              isEdit ? (
                <Save size={20} color="white" />
              ) : (
                <Upload size={20} color="white" />
              )
            }
          />
        </Box>
      </Modal>
    </Portal>
  );
}
