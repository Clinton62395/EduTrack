import { useAuth } from "@/components/constants/authContext";
import { uploadToCloudinary } from "@/components/helpers/useTrainingImagaUpload";
import { db } from "@/components/lib/firebase";
import { trainingCreateSchema } from "@/components/validators/validate.training.modal";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { buildTraining } from "../components/helpers/buildTraining";

export function useCreateOrUpdateTraining({
  onCreate,
  onUpdate,
  onClose,
  showMessage,
  existingTraining = null,
}) {
  const { user } = useAuth();
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────
  // 1. React Hook Form
  // ✅ status retiré des defaultValues — géré par publishTraining uniquement
  // ─────────────────────────────────────────
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(trainingCreateSchema),
    defaultValues: {
      maxLearners: 20,
      price: 0,
      category: "",
      customCategory: "",
      title: "",
      description: "",
    },
  });

  // ─────────────────────────────────────────
  // 2. Synchronisation du formulaire
  // ─────────────────────────────────────────
  useEffect(() => {
    if (existingTraining) {
      reset({
        // ✅ status absent du reset — il ne doit pas être modifiable via le formulaire
        startDate: existingTraining.startDate?.toDate
          ? existingTraining.startDate.toDate()
          : existingTraining.startDate
            ? new Date(existingTraining.startDate)
            : undefined,
        endDate: existingTraining.endDate?.toDate
          ? existingTraining.endDate.toDate()
          : existingTraining.endDate
            ? new Date(existingTraining.endDate)
            : undefined,
        maxLearners: existingTraining.maxLearners || 20,
        price: existingTraining.price || 0,
        category: existingTraining.category || "",
        customCategory: existingTraining.customCategory || "",
        title: existingTraining.title || "",
        description: existingTraining.description || "",
      });
      setCoverImage(existingTraining.coverImage || null);
    } else {
      reset({
        title: "",
        description: "",
        category: "",
        customCategory: "",
        maxLearners: 20,
        price: 0,
        startDate: undefined,
        endDate: undefined,
      });
      setCoverImage(null);
    }
  }, [existingTraining, reset]);

  // ─────────────────────────────────────────
  // 3. Soumission
  // ─────────────────────────────────────────
  const onSubmit = async (formData) => {
    if (!user) return;
    setLoading(true);

    try {
      // 🛡️ Verrouillage : une formation publiée ne peut plus être modifiée
      // sauf si elle est repassée en draft via unpublishTraining
      if (existingTraining && existingTraining.status === "published") {
        showMessage?.(
          "Action impossible",
          "Dépubliez la formation avant de la modifier.",
        );
        return;
      }

      // ☁️ Upload image Cloudinary si changée
      let uploadedImage = existingTraining?.coverImage || null;
      if (coverImage && coverImage !== existingTraining?.coverImage) {
        const folderPath = `Edutrack/Trainers/${user.uid}/Trainings/Covers`;
        uploadedImage = await uploadToCloudinary(coverImage, folderPath);
      }

      // 🏗️ Construction via buildTraining
      // ✅ buildTraining préserve status et codeActive depuis existingTraining
      const trainingData = {
        ...buildTraining({
          formData,
          coverImage: uploadedImage,
          user,
          existingTraining,
        }),
        // Compteurs initialisés uniquement à la création
        ...(existingTraining
          ? {}
          : { totalLessons: 0, currentLearners: 0, participants: [] }),
        updatedAt: serverTimestamp(),
      };

      // 💾 Sauvegarde
      const trainingId =
        existingTraining?.id || doc(collection(db, "formations")).id;

      await setDoc(doc(db, "formations", trainingId), trainingData, {
        merge: true,
      });

      // 🔥 Logique création uniquement
      if (!existingTraining) {
        await updateDoc(doc(db, "users", user.uid), {
          formationsCount: increment(1),
        });
        if (typeof onCreate === "function") await onCreate(trainingData);
      } else {
        if (typeof onUpdate === "function")
          await onUpdate(existingTraining.id, trainingData);
      }

      reset();
      setCoverImage(null);
      onClose?.();
      showMessage?.(
        "Succès",
        existingTraining ? "Formation mise à jour" : "Formation créée",
      );
    } catch (err) {
      console.error("Erreur soumission:", err);
      showMessage?.("Erreur", "L'enregistrement a échoué.");
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
    reset,
  };
}
