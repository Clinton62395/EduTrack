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
    // 1. Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );
    const user = userCredential.user;

    // 2. Préparation du document Firestore
    const userDoc = {
      id: user.uid,
      name: data.fullName,
      email: data.email,
      role: data.role,
      status: "pending", // Passera à "active" après vérification email
      bio: "",
      avatar: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 🔵 AJUSTEMENT LOGIQUE :
    // Si c'est un apprenant, on lui crée un tableau vide pour ses futures formations
    if (data.role === "learner") {
      userDoc.enrolledTrainings = [];
    }

    // 3. Sauvegarde dans Firestore
    await setDoc(doc(db, "users", user.uid), userDoc);

    // 4. Envoyer l'email de confirmation
    await sendEmailVerification(user);

    return { user };
  } catch (error) {
    console.error("Registration error details:", error);

    // Gestion des erreurs (ton code existant est parfait ici)
    if (error.code === "auth/network-request-failed") {
      throw new Error("Erreur de connexion réseau.");
    } else if (error.code === "auth/email-already-in-use") {
      throw new Error("Cet email est déjà utilisé.");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Email invalide.");
    } else if (error.code === "auth/weak-password") {
      throw new Error("Le mot de passe est trop faible (6 caractères min).");
    }

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
