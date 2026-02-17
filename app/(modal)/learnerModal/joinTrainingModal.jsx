import { useAuth } from "@/components/constants/authContext";
import { Snack } from "@/components/ui/snackbar";
import { Box, Button, Text } from "@/components/ui/theme";
import { InputField } from "@/hooks/auth/inputField";
import { router } from "expo-router";
import { ArrowRight, Hash, X } from "lucide-react-native";
import { useEffect, useState } from "react";
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
import { useJoinTraining } from "../../../components/features/learnerProfile/hooks/useJoindTrainings";

export function JoinTrainingModal() {
  const { user } = useAuth();
  const { joinByCode, loading } = useJoinTraining();

  const [visible, setVisible] = useState(false);
  const [snack, setSnack] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [error, setError] = useState(null);

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: { code: "" },
  });
  const codeValue = watch("code");

  // Affichage snack
  const showSnack = (message, type = "success") =>
    setSnack({ visible: true, message, type });
  const hideSnack = () => setSnack({ ...snack, visible: false });

  const openModal = () => setVisible(true);
  const closeModal = () => setVisible(false);

  // Reset form à la fermeture
  useEffect(() => {
    if (!visible) {
      reset();
      setError(null);
    }
  }, [visible]);

  const onSubmit = async (data) => {
    if (!data.code.trim()) {
      setError("Le code est requis");
      return;
    }

    try {
      const result = await joinByCode(data.code.trim().toUpperCase(), user.uid);
      if (result.success) {
        showSnack(
          `Félicitations ! Vous avez rejoint ${result.title}`,
          "success",
        );

        setTimeout(() => {
          closeModal();
          router.push({
            pathname: "/(learner-tabs)/my-trainings/[id]",
            params: { id: result.trainingId },
          });
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue");
    }
  };

  return (
    <>
      {/* Bouton flottant pour ouvrir le modal */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 30,
          right: 25,
          backgroundColor: "#2563EB",
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
        }}
        onPress={openModal}
      >
        <Text style={{ color: "white", fontSize: 30 }}>+</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={closeModal}
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
                <ScrollView keyboardShouldPersistTaps="handled">
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    marginBottom="l"
                  >
                    <Text variant="title">Rejoindre une formation</Text>
                    <X size={24} color="#6B7280" onPress={closeModal} />
                  </Box>

                  <Text variant="body" color="muted" marginBottom="m">
                    Entrez le code d'invitation à 8 caractères.
                  </Text>

                  <InputField
                    control={control}
                    name="code"
                    placeholder="Ex: AB12CD34"
                    icon={<Hash size={20} color="#2563EB" />}
                    autoCapitalize="characters"
                    maxLength={8}
                  />

                  {error && <Text variant="error">{error}</Text>}

                  <Button
                    title="Valider le code"
                    onPress={handleSubmit(onSubmit)}
                    loading={loading}
                    disabled={loading || codeValue.trim().length === 0}
                    marginTop="xl"
                    icon={<ArrowRight size={20} color="white" />}
                    iconPosition="right"
                    variant={
                      codeValue.trim().length === 0 ? "outline" : "primary"
                    }
                  />
                </ScrollView>
              </Box>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Modal>
      </Portal>

      {/* Snack */}
      <Snack
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={hideSnack}
      />
    </>
  );
}
