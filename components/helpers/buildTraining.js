import { serverTimestamp, Timestamp } from "@react-native-firebase/firestore";

// ─────────────────────────────────────────
// Générateurs de codes
// ─────────────────────────────────────────
export const generateInvitationCode = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

export const generateMasterCode = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

/**
 * Prépare les données pour Firestore (Create/Update).
 * Garantit l'absence de 'undefined' pour éviter les crashs natifs.
 */
export function buildTraining({
  formData,
  coverImage,
  user,
  existingTraining = null,
}) {
  const isOther = formData.category === "other";
  const maxLearners = formData.maxLearners ? Number(formData.maxLearners) : 20;
  const price = formData.price ? Number(formData.price) : 0;

  // Nettoyage de l'objet de base (pas d'ID dans les données Firestore)
  const baseData = existingTraining ? { ...existingTraining } : {};
  delete baseData.id;
  // ✅ On supprime aussi sessionStatus — c'est un champ calculé côté client, jamais persisté
  delete baseData.sessionStatus;

  // ✅ Conversion des dates en Timestamps v22
  const startDate = formData.startDate
    ? Timestamp.fromDate(new Date(formData.startDate))
    : baseData.startDate || null;

  const endDate = formData.endDate
    ? Timestamp.fromDate(new Date(formData.endDate))
    : baseData.endDate || null;

  return {
    ...baseData,

    // Contenu
    title: formData.title?.trim() || "Sans titre",
    description: formData.description?.trim() || "",
    category: isOther
      ? formData.customCategory?.trim() || "Autre"
      : formData.category || "Général",
    customCategory: isOther ? formData.customCategory?.trim() || "" : "",

    // ✅ Status : on ne touche JAMAIS au status métier ici
    // Il est géré exclusivement par publishTraining / unpublishTraining
    // À la création : useTrainings.createTraining force status: "draft"
    // À l'update : on préserve le status existant
    status: baseData.status || "draft",
    codeActive: baseData.codeActive ?? false,

    // Dates
    startDate,
    endDate,
    maxLearners,
    price,
    coverImage: coverImage || baseData.coverImage || null,

    // Infos formateur
    trainerId: user?.uid || baseData.trainerId || null,
    trainerName:
      user?.name ||
      user?.displayName ||
      user?.email?.split("@")[0] ||
      "Formateur",

    // ✅ Codes persistants (jamais régénérés si déjà existants)
    invitationCode: baseData.invitationCode || generateInvitationCode(),
    masterCode: baseData.masterCode || generateMasterCode(),

    // Stats
    currentLearners: baseData.currentLearners || 0,
    participants: baseData.participants || [],
    totalLessons: baseData.totalLessons || 0,
    totalModules: baseData.totalModules || 0,

    // ✅ Métadonnées v22
    createdAt: baseData.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}
