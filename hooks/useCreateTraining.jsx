import { useAuth } from "@/components/constants/authContext";
import { buildTraining } from "@/components/helpers/buildTraining";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import * as yup from "yup";

import { uploadToCloudinary } from "@/components/helpers/useTrainingImagaUpload";

// --- VALIDATION ---
const formationSchema = yup.object().shape({
  title: yup.string().min(5).required(),
  description: yup.string().required(),
  category: yup.string().required(),
  status: yup.string().required(),
  startDate: yup.date().required(),
  endDate: yup.date().min(yup.ref("startDate"), "Fin après début").required(),
  maxLearners: yup.number().min(1).required(),
  price: yup.number().required(),
});

export function useCreateTraining(onCreate, onClose) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formationSchema),
    defaultValues: {
      status: "planned",
      startDate: new Date(),
      endDate: new Date(),
      maxLearners: 20,
      price: 0,
    },
  });

  const onSubmit = async (formData) => {
    if (!user) {
      Alert.alert("Erreur", "Connexion requise");
      return;
    }

    setLoading(true);
    try {
      let uploadedImage = null;

      if (coverImage) {
        uploadedImage = await uploadToCloudinary(coverImage);
      }

      const formationData = buildTraining({
        formData,
        coverImage: uploadedImage,
        user,
      });

      await onCreate(formationData);

      Alert.alert("Succès", "Formation créée");
      reset();
      setCoverImage(null);
      onClose?.();
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Création impossible");
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    errors,
    handleSubmit,
    onSubmit,
    loading,
    coverImage,
    setCoverImage,
    setValue,
  };
}
