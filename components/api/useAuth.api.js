import { firebaseAuth as auth, db } from "@/components/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "@react-native-firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "@react-native-firebase/firestore";

// ─────────────────────────────────────────
// 📝 REGISTER
// ─────────────────────────────────────────
export const registerUser = async (data) => {
  try {
    // 1. Création Auth
    const { user } = await createUserWithEmailAndPassword(
      auth,
      data.email.trim(),
      data.password,
    );

    // 2. Base commune
    const baseUserDoc = {
      id: user.uid,
      name: data.fullName,
      email: data.email.toLowerCase().trim(),
      role: data.role,
      status: "active",
      avatar: "",
      phone: "",
      location: "",
      bio: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      pushTokens: [],
    };

    // 3. Logique de rôle métier
    let roleSpecificData = {};
    const randomID = () =>
      Math.random().toString(36).substr(2, 6).toUpperCase();

    switch (data.role) {
      case "trainer":
        roleSpecificData = {
          specialite: "",
          tarif: "",
          formationsCount: 0,
          learnersCount: 0,
          attendanceRate: 0,
          rating: 5.0,
          invitationCode: `TR-${randomID()}`,
          masterCode: `MS-${randomID()}`,
        };
        break;
      case "learner":
        roleSpecificData = {
          enrolledTrainings: [],
          trainingsJoinedCount: 0,
          modulesCompletedCount: 0,
          badgesCount: 0,
          totalMinutesSpent: 0,
          averageProgression: 0,
        };
        break;
      case "admin":
        roleSpecificData = {
          permissions: ["all"],
          manageTrainers: true,
          manageLearners: true,
        };
        break;
    }

    const finalUserDoc = { ...baseUserDoc, ...roleSpecificData };

    // 4. Sauvegarde Firestore
    await setDoc(doc(db, "users", user.uid), finalUserDoc);

    // 5. Mise à jour profil Auth
    await updateProfile(user, { displayName: data.fullName });

    // 6. Vérification email
    await sendEmailVerification(user);

    return { user: finalUserDoc };
  } catch (error) {
    console.error("Register Error:", error);
    throw error;
  }
};

// ─────────────────────────────────────────
// 🔑 LOGIN
// ─────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  try {
    const { user } = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );

    // Récupération profil
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists()) {
      throw new Error("Compte inexistant dans la base de données.");
    }

    const userData = userSnap.data();

    // Mise à jour date de connexion
    await updateDoc(doc(db, "users", user.uid), {
      status: "active",
      lastLogin: serverTimestamp(),
    });

    return { ...userData, emailVerified: user.emailVerified };
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

// ─────────────────────────────────────────
// 🛰️ FORGOT PASSWORD
// ─────────────────────────────────────────
export const forgotPasswordService = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true };
  } catch (err) {
    throw err;
  }
};
