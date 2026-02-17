import { auth, db } from "@/components/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export const registerUser = async (data) => {
  try {
    // 1. Création dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );
    const user = userCredential.user;

    // 2. Base commune à tous les rôles (Champs obligatoires du profil)
    const baseUserDoc = {
      id: user.uid,
      name: data.fullName,
      email: data.email,
      role: data.role, // 'trainer', 'learner', 'admin'
      status: "active", // On le met active directement pour tes tests
      avatar: "",
      phone: "",
      location: "",
      bio: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 3. Spécificités selon le PRD
    let roleSpecificData = {};

    if (data.role === "trainer") {
      roleSpecificData = {
        specialite: "",
        tarif: "",
        formationsCount: 0,
        learnersCount: 0,
        attendanceRate: 0,
        rating: 5.0,
        invitationCode: `TR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, // Code formateur unique
        masterCode: `MS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      };
    } else if (data.role === "learner") {
      roleSpecificData = {
        enrolledTrainings: [], // Liste des IDs de formations
        trainingsJoinedCount: 0, // Pour ProfileStats
        modulesCompletedCount: 0,
        badgesCount: 0,
        totalMinutesSpent: 0,
        averageProgression: 0, // Pour la carte Star dans ProfileStats
      };
    } else if (data.role === "admin") {
      roleSpecificData = {
        permissions: ["all"],
        manageTrainers: true,
        manageLearners: true,
      };
    }

    // Fusion des données
    const finalUserDoc = { ...baseUserDoc, ...roleSpecificData };

    // 4. Sauvegarde dans Firestore
    await setDoc(doc(db, "users", user.uid), finalUserDoc);

    // 5. Email de confirmation (optionnel en dev, mais bien de le garder)
    await sendEmailVerification(user);

    return { user: finalUserDoc };
  } catch (error) {
    console.error("Registration error:", error);
    // ... ta gestion d'erreurs existante ...
    throw error;
  }
};

/**
 * Connexion utilisateur (Reste inchangé car déjà très bon)
 */
export const loginUser = async ({ email, password }) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) throw new Error("Utilisateur non trouvé");

  const userData = userDoc.data();

  // Gestion du status Pending -> Active
  // if (userData.status === "pending") {
  //   if (!user.emailVerified) {
  //     throw new Error(
  //       "Veuillez confirmer votre email pour activer votre compte.",
  //     );
  //   } else {
  //     await setDoc(
  //       doc(db, "users", user.uid),
  //       { status: "active" },
  //       { merge: true },
  //     );
  //     userData.status = "active";
  //   }
  // }

  // accepte pending for testing
  await setDoc(
    doc(db, "users", user.uid),
    { status: "active" },
    { merge: true },
  );

  return userData;
};

/**
 * Reset Password (Reste inchangé)
 */
export const forgotPasswordService = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Lien envoyé !" };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
