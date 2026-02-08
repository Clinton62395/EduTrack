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
import { DateField } from "../helpers/DatePicker";
import { Snack } from "../ui/snackbar";

export function UpdateTrainingModal({ visible, onClose, formation }) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const {
    control,
    handleSubmit,
    onSubmit,
    errors,
    loading,
    coverImage,
    setCoverImage,
    isPlanned,
    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
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
  const startDate = useWatch({ control, name: "startDate" });

  return (
    <>
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
                  {isPlanned ? (
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
                  ) : (
                    <Box
                      height={160}
                      backgroundColor="secondaryBackground"
                      borderRadius="l"
                      justifyContent="center"
                      alignItems="center"
                    >
                      {coverImage ? (
                        <Image
                          source={{ uri: coverImage }}
                          style={{ width: "100%", height: "100%" }}
                        />
                      ) : (
                        <Text variant="caption" color="textSecondary">
                          Pas modifiable
                        </Text>
                      )}
                    </Box>
                  )}

                  {/* INPUTS */}
                  <InputField
                    control={control}
                    name="title"
                    label="Titre *"
                    placeholder="Titre formation"
                    error={errors.title}
                    editable={true}
                  />
                  <InputField
                    control={control}
                    name="description"
                    label="Description"
                    placeholder="Description..."
                    error={errors.description}
                    multiline
                    numberOfLines={5}
                    editable={true}
                  />
                  <SelectField
                    control={control}
                    name="category"
                    label="Catégorie *"
                    options={formationCategories}
                    error={errors.category}
                    enabled={isPlanned}
                  />
                  {category === "other" && isPlanned && (
                    <InputField
                      control={control}
                      name="customCategory"
                      label="Catégorie personnalisée *"
                      placeholder="Ex : DevOps, Cybersécurité..."
                      error={errors.customCategory}
                      editable={true}
                    />
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
                        editable={isPlanned}
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
                        editable={isPlanned}
                      />
                    </Box>
                  </Box>

                  {/* DATES */}
                  <Box flexDirection="row" gap="m">
                    <Box flex={1}>
                      <DateField
                        control={control}
                        name="startDate"
                        label="Date de début"
                        error={errors.startDate}
                      />
                    </Box>
                    <Box flex={1}>
                      <DateField
                        control={control}
                        name="endDate"
                        label="Date de fin"
                        minimumDate={startDate}
                        error={errors.endDate}
                      />
                    </Box>
                  </Box>
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
                    <Button
                      onPress={onClose}
                      title="Annuler"
                      variant="outline"
                    />
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

      {/* Snackbar */}
      <Snack
        visible={snackVisible}
        onDismiss={dismissSnack}
        type={snackType}
        message={snackMessage}
      />
    </>
  );
}
