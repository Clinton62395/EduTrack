// useUpdateFormation.ts
import { db } from "@/components/lib/firebase";
import { yupResolver } from "@hookform/resolvers/yup";
import { doc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { formationCategories } from "../components/features/trainerProfile/trainerDataMock";
import { uploadToCloudinary } from "../components/helpers/useTrainingImagaUpload";
import { trainingUpdateSchema } from "../components/validators/validate.training.modal";

// Schéma Yup pour validation

// Helper pour convertir proprement - DÉPLACÉ EN DEHORS DU HOOK
const convertToDate = (dateField) => {
  if (!dateField) return new Date();
  // Si c'est un Timestamp Firebase
  if (dateField?.toDate) return dateField.toDate();
  // Si c'est déjà une Date
  if (dateField instanceof Date) return dateField;
  // Si c'est une string ISO ou un timestamp
  const converted = new Date(dateField);
  return isNaN(converted.getTime()) ? new Date() : converted;
};

export function useUpdateTraining(initialData, onClose) {
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? null);
  const isPlanned = initialData?.status === "planned";

  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState("success");

  const showSnack = (message, type = "success") => {
    setSnackMessage(message);
    setSnackType(type);
    setSnackVisible(true);
  };

  const dismissSnack = () => setSnackVisible(false);

  // ← AJOUT : Stabiliser les defaultValues avec useMemo
  const defaultValues = useMemo(() => {
    const isKnownCategory = formationCategories.some(
      (c) => c.value === initialData?.category,
    );

    return {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      category: isKnownCategory ? initialData?.category : "other",
      customCategory: isKnownCategory ? "" : (initialData?.category ?? ""),
      startDate: convertToDate(initialData?.startDate),
      endDate: convertToDate(initialData?.endDate),
      price: initialData?.price ?? 0,
      maxLearners: initialData?.maxLearners ?? 0,
    };
  }, [initialData?.id]); // ← Ne change que si l'ID change

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting: loading },
  } = useForm({
    defaultValues,
    resolver: yupResolver(trainingUpdateSchema),
  });

  const onSubmit = async (data) => {
    try {
      let imageUrl = coverImage;
      if (coverImage && !coverImage.startsWith("https://")) {
        imageUrl = await uploadToCloudinary(coverImage);
      }

      const updatePayload = {
        title: data.title,
        description: data.description,
        coverImage: imageUrl,
        updatedAt: serverTimestamp(),
      };

      if (isPlanned) {
        updatePayload.category =
          data.category === "other" ? data.customCategory : data.category;
        updatePayload.price = Number(data.price);
        updatePayload.maxLearners = Number(data.maxLearners);
        updatePayload.startDate = Timestamp.fromDate(
          convertToDate(data.startDate),
        );
        updatePayload.endDate = Timestamp.fromDate(convertToDate(data.endDate));
      }

      const formationRef = doc(db, "formations", initialData.id);
      await updateDoc(formationRef, updatePayload);

      showSnack("Formation mise à jour avec succès", "success");
      if (onClose) onClose();
    } catch (error) {
      console.error("Erreur update formation :", error);
      showSnack("Impossible de mettre à jour la formation", "error");
    }
  };

  return {
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
  };
}
