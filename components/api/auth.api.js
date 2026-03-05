import { firebaseAuth as auth, db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
export const registerUser = async (data) => {
  try {
    // 1. Création dans Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(
      data.email,
      data.password,
    );
    const user = userCredential.user;

    // 2. Base commune
    const baseUserDoc = {
      id: user.uid,
      name: data.fullName,
      email: data.email,
      role: data.role,
      status: "active",
      avatar: "",
      phone: "",
      location: "",
      bio: "",
      createdAt: firestore.FieldValue.serverTimestamp(), // ✅ serverTimestamp
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    // 3. Spécificités par rôle
    let roleSpecificData = {};
    if (data.role === "trainer") {
      roleSpecificData = {
        specialite: "",
        tarif: "",
        formationsCount: 0,
        learnersCount: 0,
        attendanceRate: 0,
        rating: 5.0,
        invitationCode: `TR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        masterCode: `MS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      };
    } else if (data.role === "learner") {
      roleSpecificData = {
        enrolledTrainings: [],
        trainingsJoinedCount: 0,
        modulesCompletedCount: 0,
        badgesCount: 0,
        totalMinutesSpent: 0,
        averageProgression: 0,
      };
    } else if (data.role === "admin") {
      roleSpecificData = {
        permissions: ["all"],
        manageTrainers: true,
        manageLearners: true,
      };
    }

    const finalUserDoc = { ...baseUserDoc, ...roleSpecificData };

    // 4. Sauvegarde dans Firestore
    // ✅ db.collection().doc().set() au lieu de setDoc(doc(db, ...), ...)
    await db.collection("users").doc(user.uid).set(finalUserDoc);

    // 5. Email de vérification
    await user.sendEmailVerification();

    return { user: finalUserDoc };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  // ✅ auth.signInWithEmailAndPassword() au lieu de signInWithEmailAndPassword(auth, ...)
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  const user = userCredential.user;

  // ✅ .get() au lieu de getDoc()
  const userDoc = await db.collection("users").doc(user.uid).get();

  if (!userDoc.exists) throw new Error("Utilisateur non trouvé"); // ✅ .exists sans ()

  const userData = userDoc.data();

  // Activation du compte
  await db.collection("users").doc(user.uid).set(
    { status: "active" },
    { merge: true }, // ✅ merge fonctionne pareil
  );

  return userData;
};

// ─────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────
export const forgotPasswordService = async (email) => {
  try {
    // ✅ auth.sendPasswordResetEmail() au lieu de sendPasswordResetEmail(auth, ...)
    await auth.sendPasswordResetEmail(email);
    return { success: true, message: "Lien envoyé !" };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
