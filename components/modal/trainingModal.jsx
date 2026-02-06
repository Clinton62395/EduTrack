// CreateFormationModal.tsx (version avec masquage des boutons)
import { Box, Button, Text } from "@/components/ui/theme";
import { InputField } from "@/hooks/auth/inputField";
import { SelectField } from "@/hooks/auth/selectField";
import { useCreateTraining } from "@/hooks/useCreateTraining";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import {
  BookOpen,
  Calendar,
  Camera,
  Hash,
  Image as ImageIcon,
  Upload,
  Users,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
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
import { formationCategories } from "../features/trainerProfile/trainerDataMock";

export function CreateFormationModal({ visible, onClose, onCreate }) {
  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = useState({
    show: false,
    field: "",
  });

  // États locaux pour les dates affichées
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // État pour détecter si le clavier est affiché
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const {
    control,
    errors,
    handleSubmit,
    onSubmit,
    loading,
    coverImage,
    setCoverImage,
    setValue,
  } = useCreateTraining(onCreate, onClose);

  // --- DÉTECTION DU CLAVIER ---
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // --- LOGIQUE IMAGE ---
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

  // --- FORMATAGE DATE ---
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // --- LOGIQUE DATE ---
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker({ show: false, field: "" });

    if (selectedDate && showDatePicker.field) {
      // Mettre à jour l'état local pour l'affichage
      if (showDatePicker.field === "startDate") {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }

      // Mettre à jour le formulaire avec la date complète
      setValue(showDatePicker.field, selectedDate);
    }
  };

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

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                padding: 20,
                // Ajouter du padding bottom pour éviter que le contenu soit caché
                paddingBottom: isKeyboardVisible ? 20 : insets.bottom + 80,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Box gap="m">
                {/* SECTION IMAGE DE COUVERTURE */}
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
                      <Box width="100%" height="100%">
                        <Image
                          source={{ uri: coverImage }}
                          style={{ width: "100%", height: "100%" }}
                        />
                        <Box
                          position="absolute"
                          bottom={10}
                          right={10}
                          backgroundColor="white"
                          padding="s"
                          borderRadius="rounded"
                        >
                          <Camera size={16} color="black" />
                        </Box>
                      </Box>
                    ) : (
                      <Box alignItems="center">
                        <ImageIcon size={32} color="#2563EB" />
                        <Text variant="caption" marginTop="s">
                          Ajouter une photo (16:9)
                        </Text>
                      </Box>
                    )}
                  </Box>
                </TouchableOpacity>

                {/* CHAMPS DE TEXTE */}
                <InputField
                  control={control}
                  name="title"
                  label="Titre *"
                  placeholder="Ex: React Native Avancé"
                  error={errors.title}
                  icon={<BookOpen size={18} color="#6B7280" />}
                />

                <InputField
                  control={control}
                  name="description"
                  label="Description"
                  placeholder="Décrivez le programme..."
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
                />

                {/* SECTION DATES AVEC AFFICHAGE FORMATÉ */}
                <Box flexDirection="row" gap="m">
                  <Box flex={1}>
                    <Text
                      variant="caption"
                      color="textSecondary"
                      marginBottom="xs"
                    >
                      Date de début
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setShowDatePicker({ show: true, field: "startDate" })
                      }
                    >
                      <Box
                        flexDirection="row"
                        alignItems="center"
                        backgroundColor="secondaryBackground"
                        padding="m"
                        borderRadius="m"
                        borderWidth={1}
                        borderColor="border"
                        gap="s"
                      >
                        <Calendar size={18} color="#6B7280" />
                        <Text
                          variant="body"
                          color={startDate ? "text" : "muted"}
                        >
                          {startDate ? formatDate(startDate) : "Sélectionner"}
                        </Text>
                      </Box>
                    </TouchableOpacity>
                  </Box>

                  <Box flex={1}>
                    <Text
                      variant="caption"
                      color="textSecondary"
                      marginBottom="xs"
                    >
                      Date de fin
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setShowDatePicker({ show: true, field: "endDate" })
                      }
                    >
                      <Box
                        flexDirection="row"
                        alignItems="center"
                        backgroundColor="secondaryBackground"
                        padding="m"
                        borderRadius="m"
                        borderWidth={1}
                        borderColor="border"
                        gap="s"
                      >
                        <Calendar size={18} color="#6B7280" />
                        <Text variant="body" color={endDate ? "text" : "muted"}>
                          {endDate ? formatDate(endDate) : "Sélectionner"}
                        </Text>
                      </Box>
                    </TouchableOpacity>
                  </Box>
                </Box>

                {/* DateTimePicker natif */}
                {showDatePicker.show && (
                  <DateTimePicker
                    value={
                      showDatePicker.field === "startDate"
                        ? startDate || new Date()
                        : endDate || new Date()
                    }
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onDateChange}
                    minimumDate={new Date()} // Empêche de sélectionner une date passée
                  />
                )}

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
                      name="price"
                      label="Prix (GNF)"
                      keyboardType="numeric"
                      error={errors.price}
                      icon={<Hash size={18} color="#6B7280" />}
                    />
                  </Box>
                </Box>
              </Box>
            </ScrollView>

            {/* Actions - Masqués quand le clavier est visible */}
            {!isKeyboardVisible && (
              <Box
                padding="m"
                flexDirection="row"
                gap="m"
                justifyContent="space-between"
                alignItems="center"
                borderTopWidth={1}
                borderTopColor="border"
                style={{ paddingBottom: insets.bottom + 16 }}
                backgroundColor="white"
                width="100%"
              >
                <Box flex={1}>
                  <Button
                    onPress={onClose}
                    title="Annuler"
                    variant="outline"
                    icon={<X size={20} color="white" />}
                    iconPosition="right"
                  />
                </Box>
                <Box flex={1}>
                  <Button
                    onPress={handleSubmit(onSubmit)}
                    title={loading ? "Création..." : "Créer"}
                    variant="secondary"
                    disabled={loading}
                    icon={<Upload size={20} color="white" />}
                    iconPosition="right"
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
