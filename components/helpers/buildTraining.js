import firestore from "@react-native-firebase/firestore";

// --- Générateurs simples (Alternative à nanoid pour React Native) ---
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

  // Sécurité : On nettoie l'objet de base pour ne pas réinjecter l'ID dans les données
  const baseData = existingTraining ? { ...existingTraining } : {};
  delete baseData.id;

  // 🛠 Conversion des dates en Timestamps natifs
  // On s'assure de ne jamais passer 'undefined'
  const startDate = formData.startDate
    ? firestore.Timestamp.fromDate(new Date(formData.startDate))
    : baseData.startDate || null;

  const endDate = formData.endDate
    ? firestore.Timestamp.fromDate(new Date(formData.endDate))
    : baseData.endDate || null;

  return {
    // On propage les données existantes d'abord
    ...baseData,

    // Champs obligatoires ou nettoyés
    title: formData.title?.trim() || "Sans titre",
    description: formData.description?.trim() || "",
    category: isOther
      ? formData.customCategory?.trim() || "Autre"
      : formData.category || "Général",
    customCategory: isOther ? formData.customCategory?.trim() || "" : "",
    status: formData.status || baseData.status || "planned",

    // ✅ Dates (Jamais undefined)
    startDate,
    endDate,

    maxLearners,
    price,

    coverImage: coverImage || baseData.coverImage || null,

    // ✅ Infos Formateur
    trainerId: user?.uid || baseData.trainerId || null,
    trainerName:
      user?.name ||
      user?.displayName ||
      user?.email?.split("@")[0] ||
      "Formateur",

    // ✅ Codes persistants (On ne les régénère pas s'ils existent déjà)
    invitationCode: baseData.invitationCode || generateInvitationCode(),
    masterCode: baseData.masterCode || generateMasterCode(),

    // ✅ Statistiques et participants
    currentLearners: baseData.currentLearners || 0,
    participants: baseData.participants || [],
    totalLessons: baseData.totalLessons || 0,
    totalModules: baseData.totalModules || 0,

    // ✅ Métadonnées de synchronisation
    createdAt: baseData.createdAt || firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };
}
