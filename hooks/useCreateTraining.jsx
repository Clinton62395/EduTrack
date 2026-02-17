import { useAuth } from "@/components/constants/authContext";
import { uploadToCloudinary } from "@/components/helpers/useTrainingImagaUpload";
import { yupResolver } from "@hookform/resolvers/yup";
import { doc, increment, updateDoc } from "firebase/firestore";
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
  existingTraining = null, // La formation à modifier (null si création)
}) {
  const { user } = useAuth();
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Initialisation du formulaire
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

  // 2. 🔥 SYNCHRONISATION : Met à jour le formulaire quand existingTraining change
  // C'est ce qui permet au modal de se remplir quand tu cliques sur "Modifier"
  useEffect(() => {
    if (existingTraining) {
      reset({
        status: existingTraining.status || "planned",
        startDate: existingTraining.startDate
          ? new Date(existingTraining.startDate)
          : undefined,
        endDate: existingTraining.endDate
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
      // Si pas d'existingTraining, on vide tout (mode création)
      reset({
        status: "planned",
        title: "",
        description: "",
        category: "",
        maxLearners: 20,
        price: 0,
      });
      setCoverImage(null);
    }
  }, [existingTraining, reset]);

  // 3. SOUMISSION DU FORMULAIRE
  const onSubmit = async (formData) => {
    if (!user) return;
    setLoading(true);

    try {
      // Sécurité : pas de modif si la formation est déjà lancée
      if (existingTraining && existingTraining.status !== "planned") {
        showMessage?.(
          "Action impossible",
          "Seules les formations avec le statut 'À venir' (planned) peuvent être modifiées.",
        );
        return;
      }

      // Gestion de l'image (Upload seulement si modifiée)
      const folderPath = `Edutrack/Trainers/${user.uid}/Trainings/Covers`;
      let uploadedImage = existingTraining?.coverImage || null;
      if (coverImage && coverImage !== existingTraining?.coverImage) {
        uploadedImage = await uploadToCloudinary(coverImage, folderPath);
      }

      // Construction de l'objet DATA propre (via ta factory buildTraining)
      const trainingData = buildTraining({
        formData,
        coverImage: uploadedImage,
        user,
        existingTraining,
      });

      // Dans ta fonction onSubmit, au moment de la création :
      // 4. ✅ APPEL DU CRUD
      if (existingTraining?.id) {
        // Mode UPDATE (on ne change pas le compteur ici)
        if (typeof onUpdate === "function") {
          await onUpdate(existingTraining.id, trainingData);
        }
      } else {
        // Mode CREATE
        if (typeof onCreate === "function") {
          await onCreate(trainingData);

          // 🔥 AJOUT : Incrémentation du compteur de formations pour le formateur
          try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              formationsCount: increment(1),
            });
          } catch (countError) {
            console.error("Erreur mise à jour formationsCount:", countError);
          }
        }
      }

      // 5. FINALISATION
      reset();
      setCoverImage(null);
      onClose?.(); // Ferme le modal après succès
    } catch (err) {
      console.error("Erreur soumission formation:", err);
      showMessage?.(
        "Erreur",
        "Une erreur est survenue lors de l'enregistrement.",
      );
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
