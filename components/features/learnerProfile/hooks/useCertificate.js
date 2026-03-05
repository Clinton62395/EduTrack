import { db } from "@/components/lib/firebase"; // Instance native
import firestore from "@react-native-firebase/firestore"; // Pour serverTimestamp
import axios from "axios";
import { useEffect, useState } from "react";
import {
  generateCertificatePDF,
  generateMatricule,
} from "../../../helpers/generateLearnerCertificate";

const CLOUDINARY_CLOUD_NAME = "dhpbglioz";
const CLOUDINARY_UPLOAD_PRESET = "edutrack_unsigned";

// Fonction d'upload reste inchangée (axios fonctionne pareil)
async function uploadPDFToCloudinary(fileUri, fileName) {
  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    type: "application/pdf",
    name: fileName,
  });
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "Edutrack/Learner/Certificates");

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data.secure_url;
}

export function useCertificate(userId, trainingId, formation, learnerName) {
  const [certificate, setCertificate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const certId = `${userId}_${trainingId}`;

  // 1️⃣ Écoute temps réel (Syntaxe Native)
  useEffect(() => {
    if (!userId || !trainingId) {
      setLoading(false);
      return;
    }
    const unsub = db
      .collection("certificates")
      .doc(certId)
      .onSnapshot(
        (snap) => {
          setCertificate(snap.exists ? { id: snap.id, ...snap.data() } : null);
          setLoading(false);
        },
        (err) => console.error("Snapshot error:", err),
      );

    return () => unsub();
  }, [userId, trainingId]);

  // 2️⃣ Vérification éligibilité (Optimisée sans boucle bloquante)
  useEffect(() => {
    if (!userId || !trainingId || certificate || loading) return;

    const checkEligibility = async () => {
      setChecking(true);
      try {
        // A. Récupérer modules et progrès en PARALLÈLE
        const [modulesSnap, progressSnap, quizResultsSnap] = await Promise.all([
          db
            .collection("formations")
            .doc(trainingId)
            .collection("modules")
            .get(),
          db
            .collection("userProgress")
            .where("userId", "==", userId)
            .where("trainingId", "==", trainingId)
            .get(),
          db
            .collection("quizResults")
            .where("userId", "==", userId)
            .where("trainingId", "==", trainingId)
            .where("passed", "==", true)
            .get(),
        ]);

        const modules = modulesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        if (!modules.length) return setEligible(false);

        const completedLessonIds = progressSnap.docs.map(
          (d) => d.data().lessonId,
        );
        const passedModuleIds = quizResultsSnap.docs.map(
          (d) => d.data().moduleId,
        );

        // B. Récupérer TOUTES les leçons et TOUS les quiz de la formation en une seule vague
        const lessonQueries = modules.map((m) =>
          db
            .collection("formations")
            .doc(trainingId)
            .collection("modules")
            .doc(m.id)
            .collection("lessons")
            .get(),
        );
        const quizQueries = modules.map((m) =>
          db
            .collection("formations")
            .doc(trainingId)
            .collection("modules")
            .doc(m.id)
            .collection("quiz")
            .get(),
        );

        const allLessonsSnaps = await Promise.all(lessonQueries);
        const allQuizSnaps = await Promise.all(quizQueries);

        // C. Validation Logique
        let allLessonsCompleted = true;
        let allQuizPassed = true;

        allLessonsSnaps.forEach((snap, index) => {
          const lessonIds = snap.docs.map((d) => d.id);
          if (!lessonIds.every((id) => completedLessonIds.includes(id)))
            allLessonsCompleted = false;
        });

        allQuizSnaps.forEach((snap, index) => {
          const moduleId = modules[index].id;
          if (snap.size > 0 && !passedModuleIds.includes(moduleId))
            allQuizPassed = false;
        });

        setEligible(allLessonsCompleted && allQuizPassed);
      } catch (error) {
        console.error("Erreur éligibilité:", error);
        setEligible(false);
      } finally {
        setChecking(false);
      }
    };

    checkEligibility();
  }, [userId, trainingId, certificate, loading]);

  // 3️⃣ Génération (Syntaxe Native)
  const generateCertificate = async () => {
    if (!eligible || generating || certificate) return;

    try {
      setGenerating(true);

      let logoUrl = null;
      let primaryColor = "#2563EB";

      if (formation?.trainerId) {
        const trainerSnap = await db
          .collection("users")
          .doc(formation.trainerId)
          .get();
        if (trainerSnap.exists) {
          const t = trainerSnap.data();
          logoUrl = t.certificateLogo || null;
          primaryColor = t.certificateColor || "#2563EB";
        }
      }

      const matricule = generateMatricule();
      const verifyUrl = `https://edutrack.app/verify/${matricule}`;
      const issuedAt = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const pdfUri = await generateCertificatePDF({
        learnerName,
        formationTitle: formation?.title || "Formation",
        trainerName: formation?.trainerName || "Formateur",
        issuedAt,
        logoUrl,
        primaryColor,
        matricule,
        verifyUrl,
      });

      const fileName = `cert_${userId}_${trainingId}.pdf`;
      const certificateUrl = await uploadPDFToCloudinary(pdfUri, fileName);

      // ✅ Utilisation de serverTimestamp() natif
      await db
        .collection("certificates")
        .doc(certId)
        .set({
          userId,
          trainingId,
          learnerName,
          formationTitle: formation?.title || "Formation",
          trainerName: formation?.trainerName || "Formateur",
          certificateUrl,
          issuedAt: firestore.FieldValue.serverTimestamp(),
          brandColor: primaryColor,
          matricule,
          verifyUrl,
        });
    } catch (error) {
      console.error("Erreur génération certificat:", error);
      alert("Erreur lors de la génération. Vérifiez votre connexion.");
    } finally {
      setGenerating(false);
    }
  };

  return {
    certificate,
    checking,
    eligible,
    generating,
    loading,
    generateCertificate,
  };
}
