import { useAuth } from "@/components/constants/authContext";
import { uploadToCloudinary } from "@/components/helpers/useTrainingImagaUpload";
import { yupResolver } from "@hookform/resolvers/yup";
import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { buildTraining } from "../components/helpers/buildTraining";
import { db } from "../components/lib/firebase";
import { trainingCreateSchema } from "../components/validators/validate.training.modal";

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

  // 1. Initialisation React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(trainingCreateSchema),
    defaultValues: {
      status: "planned",
      maxLearners: 20,
      price: 0,
      category: "",
      customCategory: "",
      title: "",
      description: "",
    },
  });

  // 2. 🔥 Synchronisation Native du Formulaire
  useEffect(() => {
    if (existingTraining) {
      // On remplit avec les données existantes pour l'édition
      reset({
        status: existingTraining.status || "planned",
        // Conversion native pour les DatePickers
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
      // Reset complet pour la création
      reset({
        status: "planned",
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

  // 3. Soumission (Optimisée pour le Cloud et Firestore)
  const onSubmit = async (formData) => {
    if (!user) return;
    setLoading(true);

    try {
      // 🛡️ Sécurité : Verrouillage des modifications si déjà lancé
      if (existingTraining && existingTraining.status !== "planned") {
        showMessage?.(
          "Action impossible",
          "Seules les formations 'À venir' peuvent être modifiées.",
        );
        return;
      }

      // ☁️ Gestion Image (Cloudinary)
      let uploadedImage = existingTraining?.coverImage || null;
      if (coverImage && coverImage !== existingTraining?.coverImage) {
        const folderPath = `Edutrack/Trainers/${user.uid}/Trainings/Covers`;
        uploadedImage = await uploadToCloudinary(coverImage, folderPath);
      }

      // 🏗️ Construction de l'objet via Factory
      // 2. Préparation des données avec les nouveaux compteurs
      const trainingData = {
        ...buildTraining({
          formData,
          coverImage: uploadedImage,
          user,
          existingTraining,
        }),
        // 🔥 On initialise les compteurs à la création uniquement
        ...(existingTraining
          ? {}
          : {
              totalLessons: 0,
              currentLearners: 0,
              participants: [],
            }),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // 3. 💾 Opération Unique via SET (au lieu de if/else if possible)
      const trainingId =
        existingTraining?.id || db.collection("formations").doc().id;
      const trainingRef = db.collection("formations").doc(trainingId);

      // On utilise .set() pour être "tout-terrain"
      await trainingRef.set(trainingData, { merge: true });

      // 4. 🔥 Logique spécifique au mode Création
      if (!existingTraining) {
        // Incrémentation du compteur de formations du formateur
        await db
          .collection("users")
          .doc(user.uid)
          .update({
            formationsCount: firestore.FieldValue.increment(1),
          });

        if (typeof onCreate === "function") await onCreate(trainingData);
      } else {
        if (typeof onUpdate === "function")
          await onUpdate(existingTraining.id, trainingData);
      }

      // 🏁 Finalisation
      reset();
      setCoverImage(null);
      onClose?.();
      showMessage?.(
        "Succès",
        existingTraining ? "Formation mise à jour" : "Formation créée",
      );
    } catch (err) {
      console.error("Erreur soumission native:", err);
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
