import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
// services/authService.js
import { auth, db } from "@/components/lib/firabase";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { nanoid } from "nanoid";

// services/authService.js
export const registerUser = async (data) => {
  try {
    // 1. Créer l'utilisateur Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );
    const user = userCredential.user;

    // 2. Générer le code d'invitation pour le formateur
    let invitationCode = null;
    if (data.role === "trainer") {
      invitationCode = nanoid(8);
    }

    // 3. Créer le document Firestore
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      name: data.fullName,
      email: data.email,
      role: data.role,
      status: "pending",
      bio: data.bio || "",
      avatar: data.avatar || "",
      ...(data.role === "learner" && {
        formationId: data.formationId,
        trainerId: data.trainerId,
      }),
      ...(data.role === "trainer" && { invitationCode }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 4. Envoyer l'email de confirmation
    await sendEmailVerification(user);

    return { user, invitationCode };
  } catch (error) {
    console.error("Registration error details:", error);

    // Messages d'erreur plus clairs
    if (error.code === "auth/network-request-failed") {
      throw new Error(
        "Erreur de connexion réseau. Vérifiez votre connexion Internet.",
      );
    } else if (error.code === "auth/email-already-in-use") {
      throw new Error("Cet email est déjà utilisé.");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Email invalide.");
    } else if (error.code === "auth/weak-password") {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
    }

    throw error;
  }
};

/**
 * Connexion utilisateur
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

  if (userData.status === "pending") {
    if (!user.emailVerified) {
      throw new Error(
        "Veuillez confirmer votre email pour activer votre compte.",
      );
    } else {
      // Si l'utilisateur a confirmé son email, on peut passer le status à active
      await setDoc(
        doc(db, "users", user.uid),
        { status: "active" },
        { merge: true },
      );
      userData.status = "active";
    }
  }

  return userData;
};

// forgotPassword function

/**
 * Envoie un lien de réinitialisation de mot de passe
 * @param {string} email
 */
export const forgotPasswordService = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Un lien de réinitialisation a été envoyé !",
    };
  } catch (err) {
    console.error("forgotPassword error", err);
    return { success: false, message: err.message };
  }
};
