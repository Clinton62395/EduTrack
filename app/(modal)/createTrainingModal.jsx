import * as ImagePicker from "expo-image-picker";
import {
  BookOpen,
  Camera,
  Hash,
  Image as ImageIcon,
  Ticket,
  Users,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useWatch } from "react-hook-form";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Modal, Portal } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Box, Button, Text } from "@/components/ui/theme";
import { InputField } from "@/hooks/auth/inputField";
import { SelectField } from "@/hooks/auth/selectField";
import { useCreateOrUpdateTraining } from "@/hooks/useCreateTraining";
import { formationCategories } from "../../components/features/trainerProfile/trainerDataMock";
import { DateField } from "../../components/helpers/DatePicker";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function CreateTrainingModal({
  visible,
  onClose,
  onCreate,
  onUpdate,
  initialData = null,
}) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
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
  } = useCreateOrUpdateTraining({
    onCreate,
    onUpdate,
    onClose,
    existingTraining: initialData,
  });

  const category = useWatch({ control, name: "category" });
  const startDate = useWatch({ control, name: "startDate" });

  // --- Hauteur dynamique du modal ---
  const modalHeight = useMemo(
    () => SCREEN_HEIGHT * 0.84, // 85% de l'écran
    [],
  );

  // --- Gestionnaires mémorisés ---
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setCoverImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection d'image:", error);
    }
  }, [setCoverImage]);

  const handleFormSubmit = useCallback(
    (data) => {
      Keyboard.dismiss();
      onSubmit(data);
    },
    [onSubmit],
  );
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Erreurs de validation actives :", errors);
    }
  }, [errors]);

  // --- Scroll vers un champ spécifique quand il est focus ---
  const scrollToField = useCallback((yPosition) => {
    scrollViewRef.current?.scrollTo({ y: yPosition, animated: true });
  }, []);

  // --- Reset à l'ouverture/fermeture ---
  useEffect(() => {
    if (visible) {
      if (initialData) {
        reset({
          title: initialData.title || "",
          description: initialData.description || "",
          category: initialData.category || "",
          customCategory: initialData.customCategory || "",
          startDate: initialData.startDate || null,
          endDate: initialData.endDate || null,
          maxLearners: initialData.maxLearners?.toString() || "",
          price: initialData.price?.toString() || "",
          status: initialData.status || "planned",
        });
        setCoverImage(initialData.coverImage || null);
      }
    }
  }, [visible, initialData, reset, setCoverImage]);

  // --- Nettoyage à la fermeture ---
  useEffect(() => {
    if (!visible) {
      const timeout = setTimeout(() => {
        reset();
        setCoverImage(null);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [visible, reset, setCoverImage]);

  // --- Styles mémorisés ---
  const modalStyle = useMemo(
    () => ({
      backgroundColor: "white",
      marginHorizontal: 16,
      marginTop: insets.top + 16,
      marginBottom: 16,
      borderRadius: 32,
      overflow: "hidden",
      height: modalHeight,
    }),
    [insets.top, modalHeight],
  );

  // --- Composant Image avec fallback ---
  const CoverImageSection = useCallback(
    () => (
      <TouchableOpacity
        onPress={handlePickImage}
        activeOpacity={0.8}
        accessibilityLabel="Sélectionner une image de couverture"
      >
        <Box
          height={160} // Réduit légèrement
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
            <View style={{ width: "100%", height: "100%" }}>
              <Image
                source={{ uri: coverImage }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              <Box
                position="absolute"
                bottom={8}
                right={8}
                backgroundColor="white"
                padding="xs"
                borderRadius="m"
                elevation={2}
              >
                <Camera size={16} color="black" />
              </Box>
            </View>
          ) : (
            <Box alignItems="center">
              <ImageIcon size={32} color="#2563EB" />
              <Text
                variant="caption"
                marginTop="xs"
                fontWeight="500"
                fontSize={12}
              >
                Ajouter une bannière
              </Text>
            </Box>
          )}
        </Box>
      </TouchableOpacity>
    ),
    [coverImage, handlePickImage],
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={modalStyle}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, backgroundColor: "white" }}>
              {/* HEADER - Fixe en haut */}
              <Box
                padding="m"
                borderBottomWidth={1}
                borderBottomColor="border"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                backgroundColor="white"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                  zIndex: 10,
                }}
              >
                <Text variant="title" fontSize={18} fontWeight="600">
                  {isEdit ? "Modifier la formation" : "Nouvelle formation"}
                </Text>

                <TouchableOpacity
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Box
                    backgroundColor="secondaryBackground"
                    padding="xs"
                    borderRadius="rounded"
                  >
                    <X size={18} color="#6B7280" />
                  </Box>
                </TouchableOpacity>
              </Box>

              {/* FORM SCROLLABLE */}
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 16,
                  paddingBottom: 100, // Espace pour le footer
                }}
              >
                <Box gap="m">
                  <CoverImageSection />

                  <InputField
                    control={control}
                    name="title"
                    label="Titre de la formation *"
                    placeholder="Ex: Expert React Native"
                    error={errors.title}
                    icon={<BookOpen size={18} color="#6B7280" />}
                    onFocus={() => scrollToField(0)}
                  />

                  <InputField
                    control={control}
                    name="description"
                    label="Description"
                    placeholder="Objectifs de la formation..."
                    error={errors.description}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    onFocus={() => scrollToField(100)}
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
                      onFocus={() => scrollToField(200)}
                    />
                  )}

                  <Box flexDirection="row" gap="s">
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

                  <Box flexDirection="row" gap="s">
                    <Box flex={1}>
                      <InputField
                        control={control}
                        name="maxLearners"
                        label="Capacité max"
                        keyboardType="numeric"
                        error={errors.maxLearners}
                        icon={<Users size={18} color="#6B7280" />}
                        onFocus={() => scrollToField(300)}
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
                        onFocus={() => scrollToField(350)}
                      />
                    </Box>
                  </Box>
                </Box>
              </ScrollView>

              {/* FOOTER - Fixe en bas avec gestion clavier */}
              <Box
                backgroundColor="white"
                padding="m"
                flexDirection="row"
                justifyContent="space-between"
                gap="m"
                borderTopWidth={1}
                borderTopColor="border"
                alignItems="center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 8,
                  zIndex: 10,
                }}
              >
                <Box flex={1}>
                  <Button
                    title="Annuler"
                    onPress={handleClose}
                    variant="outline"
                    disabled={loading}
                  />
                </Box>

                <Box flex={1}>
                  <Button
                    title={
                      loading
                        ? "Chargement..."
                        : isEdit
                          ? "Mettre à jour"
                          : "Publier"
                    }
                    onPress={handleSubmit(handleFormSubmit)}
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                  />
                </Box>
              </Box>

              {/* Espace supplémentaire pour iOS quand le clavier est ouvert */}
              {Platform.OS === "ios" && <View style={{ height: 0 }} />}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}
