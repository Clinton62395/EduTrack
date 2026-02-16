import { serverTimestamp } from "firebase/firestore";
import { nanoid } from "nanoid";

// --- Générateurs ---
export const generateInvitationCode = () => nanoid(8).toUpperCase();
export const generateMasterCode = () => nanoid(8).toUpperCase();

// --- Factory Formation ---
export function buildTraining({
  formData,
  coverImage,
  user,
  existingTraining = null,
}) {
  const isOther = formData.category === "other";
  const maxLearners = formData.maxLearners ? Number(formData.maxLearners) : 20;
  const price = formData.price ? Number(formData.price) : 0;

  // 1. On crée une copie sans l'ID pour éviter de polluer Firestore
  const baseData = existingTraining ? { ...existingTraining } : {};
  delete baseData.id; // 🔴 TRÈS IMPORTANT : On retire l'ID des datas

  return {
    ...baseData, // On garde les champs existants (codes, dates de création, etc.)
    title: formData.title,
    description: formData.description || "",
    category: isOther ? formData.customCategory?.trim() : formData.category,
    customCategory: isOther ? formData.customCategory?.trim() : "",
    status: formData.status || "planned",

    startDate: formData.startDate?.toISOString() || null,
    endDate: formData.endDate?.toISOString() || null,

    maxLearners,
    price,

    coverImage: coverImage || null,

    trainerId: user.uid,
    trainerName: user.name || user.email?.split("@")[0] || "Formateur",

    invitationCode:
      existingTraining?.invitationCode || generateInvitationCode(),
    masterCode: existingTraining?.masterCode || generateMasterCode(),
    currentLearners: existingTraining?.currentLearners || 0,
    participants: existingTraining?.participants || [],

    createdAt: existingTraining?.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}
