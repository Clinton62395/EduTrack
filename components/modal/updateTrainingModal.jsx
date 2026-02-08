// UpdateFormationModal.tsx
import { Box, Button, Text } from "@/components/ui/theme";
import { InputField } from "@/hooks/auth/inputField";
import { SelectField } from "@/hooks/auth/selectField";
import * as ImagePicker from "expo-image-picker";
import { Camera, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUpdateTraining } from "../../hooks/useUpdatesTrainings";
import { formationCategories } from "../features/trainerProfile/trainerDataMock";

export function UpdateTrainingModal({ visible, onClose, formation }) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const {
    control,
    watch,
    handleSubmit,
    onSubmit,
    errors,
    loading,
    coverImage,
    setCoverImage,
  } = useUpdateTraining(formation, onClose);

  // Détection clavier
  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };
  const category = useWatch({ control, name: "category" });
  const status = useWatch({ control, name: "status" });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
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
            {/* HEADER */}
            <Box
              padding="l"
              borderBottomWidth={1}
              borderBottomColor="border"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text variant="title">Modifier formation</Text>
              <TouchableOpacity onPress={onClose} hitSlop={20}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </Box>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: isKeyboardVisible ? 20 : insets.bottom + 80,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <Box gap="m">
                {/* IMAGE */}
                <Text variant="body" fontWeight="700">
                  Image de couverture
                </Text>
                <TouchableOpacity onPress={pickImage}>
                  <Box
                    height={160}
                    backgroundColor="secondaryBackground"
                    borderRadius="l"
                    borderStyle="dashed"
                    borderWidth={1}
                    borderColor="primary"
                    justifyContent="center"
                    alignItems="center"
                    overflow="hidden"
                  >
                    {coverImage ? (
                      <Image
                        source={{ uri: coverImage }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    ) : (
                      <Box alignItems="center">
                        <Camera size={32} color="#2563EB" />
                        <Text variant="caption" marginTop="s">
                          Ajouter une photo (16:9)
                        </Text>
                      </Box>
                    )}
                  </Box>
                </TouchableOpacity>

                {/* INPUTS */}
                <InputField
                  control={control}
                  name="title"
                  label="Titre *"
                  placeholder="Titre formation"
                  error={errors.title}
                />
                <InputField
                  control={control}
                  name="description"
                  label="Description"
                  placeholder="Description..."
                  error={errors.description}
                  multiline
                  numberOfLines={5}
                />
                <SelectField
                  control={control}
                  name="category"
                  label="Catégorie *"
                  options={formationCategories}
                  error={errors.category}
                />
                {category === "other" && (
                  <Box>
                    <InputField
                      control={control}
                      name="customCategory"
                      label="Catégorie personnalisée *"
                      placeholder="Ex : DevOps, Cybersécurité..."
                      error={errors.customCategory}
                    />
                  </Box>
                )}

                <Box flexDirection="row" gap="m">
                  <Box flex={1}>
                    <InputField
                      control={control}
                      name="maxLearners"
                      label="Nombre max"
                      keyboardType="numeric"
                      placeholder="Nombre max"
                      error={errors.maxLearners}
                    />
                  </Box>
                  <Box flex={1}>
                    <InputField
                      control={control}
                      name="price"
                      label="Prix (GNF)"
                      placeholder="Prix"
                      keyboardType="numeric"
                      error={errors.price}
                    />
                  </Box>
                </Box>

                {/* SECTION DATES AVEC AFFICHAGE FORMATÉ */}
                {status === "planned" && (
                  <Box>
                    <InputField
                      control={control}
                      name="startDate"
                      label="Date de début"
                      placeholder="Date de début"
                      keyboardType="date"
                      error={errors.startDate}
                    />
                    <InputField
                      control={control}
                      name="endDate"
                      label="Date de fin"
                      placeholder="Date de fin"
                      keyboardType="date"
                      error={errors.endDate}
                    />
                  </Box>
                )}
              </Box>
            </ScrollView>

            {/* ACTIONS */}
            {!isKeyboardVisible && (
              <Box
                padding="m"
                flexDirection="row"
                gap="m"
                justifyContent="space-between"
                borderTopWidth={1}
                borderTopColor="border"
                style={{ paddingBottom: insets.bottom + 16 }}
                backgroundColor="white"
              >
                <Box flex={1}>
                  <Button onPress={onClose} title="Annuler" variant="outline" />
                </Box>
                <Box flex={1}>
                  <Button
                    onPress={handleSubmit(onSubmit)}
                    title={loading ? "Mise à jour..." : "Modifier"}
                    variant="secondary"
                    disabled={loading}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </KeyboardAvoidingView>
    </Modal>
  );
}
