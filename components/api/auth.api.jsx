// services/authService.js
import { auth, db } from "@/components/lib/firabase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { nanoid } from "nanoid";

/**
 * Crée un utilisateur dans Firebase Auth et Firestore
 */
export const registerUser = async (data) => {
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
    invitationCode = nanoid(8); // code unique
  }

  // 3. Créer le document Firestore avec status pending
  await setDoc(doc(db, "users", user.uid), {
    id: user.uid,
    name: data.fullName,
    email: data.email,
    role: data.role,
    status: "pending", // <-- pending jusqu'à confirmation email
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

  return { user, invitationCode }; // retourne l'utilisateur et le code si trainer
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
