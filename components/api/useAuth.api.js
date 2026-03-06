import { firebaseAuth as auth, db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";

// ─────────────────────────────────────────
// 📝 REGISTER
// ─────────────────────────────────────────
export const registerUser = async (data) => {
  try {
    // 1. Création Auth
    const { user } = await auth.createUserWithEmailAndPassword(
      data.email.trim(),
      data.password,
    );

    // 2. Base commune (Schema EduTrack)
    const baseUserDoc = {
      id: user.uid,
      name: data.fullName,
      email: data.email.toLowerCase().trim(),
      role: data.role, // 'trainer', 'learner', 'admin'
      status: "active",
      avatar: "",
      phone: "",
      location: "",
      bio: "",
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      // 📱 Pour les futurs Push Notifications
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
    await db.collection("users").doc(user.uid).set(finalUserDoc);

    // 5. Mise à jour du profil Auth (pour displayname)
    await user.updateProfile({ displayName: data.fullName });

    // 6. Vérification email
    await user.sendEmailVerification();

    return { user: finalUserDoc };
  } catch (error) {
    console.error("Native Register Error:", error);
    throw error;
  }
};

// ─────────────────────────────────────────
// 🔑 LOGIN
// ─────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  try {
    const { user } = await auth.signInWithEmailAndPassword(
      email.trim(),
      password,
    );

    // Récupération Profil
    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
      throw new Error("Compte inexistant dans la base de données.");
    }

    const userData = userDoc.data();

    // Mise à jour date de connexion (Atomic Update)
    await db.collection("users").doc(user.uid).update({
      status: "active",
      lastLogin: firestore.FieldValue.serverTimestamp(),
    });

    return { ...userData, emailVerified: user.emailVerified };
  } catch (error) {
    console.error("Native Login Error:", error);
    throw error;
  }
};

// ─────────────────────────────────────────
// 🛰️ FORGOT PASSWORD
// ─────────────────────────────────────────
export const forgotPasswordService = async (email) => {
  try {
    await auth.sendPasswordResetEmail(email.trim());
    return { success: true };
  } catch (err) {
    throw err;
  }
};
