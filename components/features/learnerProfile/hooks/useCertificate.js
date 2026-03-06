import { db } from "@/components/lib/firebase";
import firestore from "@react-native-firebase/firestore";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  generateCertificatePDF,
  generateMatricule,
} from "../../../helpers/generateLearnerCertificate";

const CLOUDINARY_CLOUD_NAME = "dhpbglioz";
const CLOUDINARY_UPLOAD_PRESET = "edutrack_unsigned";

/**
 * Service d'upload vers Cloudinary (PDF)
 */
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

  // 1️⃣ ÉCOUTE TEMPS RÉEL DU CERTIFICAT
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
        (err) => {
          console.error("Snapshot error:", err);
          setLoading(false);
        },
      );
    return () => unsub();
  }, [userId, trainingId]);

  // 2️⃣ VÉRIFICATION DE L'ÉLIGIBILITÉ (Logique métier EduTrack)
  useEffect(() => {
    // On ne vérifie que si nécessaire
    if (!userId || !trainingId || certificate || loading) return;

    const checkEligibility = async () => {
      setChecking(true);
      try {
        // A. Récupération des données de base en parallèle
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

        if (modulesSnap.empty) return setEligible(false);

        const completedLessonIds = progressSnap.docs.map(
          (d) => d.data().lessonId,
        );
        const passedModuleIds = quizResultsSnap.docs.map(
          (d) => d.data().moduleId,
        );

        // B. Analyse profonde (Leçons et Quiz) en parallèle
        const lessonPromises = modulesSnap.docs.map((m) =>
          db
            .collection("formations")
            .doc(trainingId)
            .collection("modules")
            .doc(m.id)
            .collection("lessons")
            .get(),
        );
        const quizPromises = modulesSnap.docs.map((m) =>
          db
            .collection("formations")
            .doc(trainingId)
            .collection("modules")
            .doc(m.id)
            .collection("quiz")
            .get(),
        );

        const allLessonsSnaps = await Promise.all(lessonPromises);
        const allQuizSnaps = await Promise.all(quizPromises);

        // C. Validation finale
        let allLessonsCompleted = true;
        let allQuizPassed = true;

        allLessonsSnaps.forEach((snap) => {
          const lessonIds = snap.docs.map((d) => d.id);
          if (
            lessonIds.length > 0 &&
            !lessonIds.every((id) => completedLessonIds.includes(id))
          ) {
            allLessonsCompleted = false;
          }
        });

        allQuizSnaps.forEach((snap, index) => {
          const moduleId = modulesSnap.docs[index].id;
          // S'il y a un quiz dans ce module et qu'il n'est pas réussi -> Inéligible
          if (!snap.empty && !passedModuleIds.includes(moduleId)) {
            allQuizPassed = false;
          }
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

  // 3️⃣ GÉNÉRATION ET SAUVEGARDE (Mise en production)
  const generateCertificate = async () => {
    if (!eligible || generating || certificate) return;

    try {
      setGenerating(true);

      // Personnalisation selon le formateur (Identité visuelle)
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
      const issuedAtDate = new Date();
      const issuedAtFormatted = issuedAtDate.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // A. Génération locale du PDF
      const pdfUri = await generateCertificatePDF({
        learnerName,
        formationTitle: formation?.title || "Formation",
        trainerName: formation?.trainerName || "Formateur",
        issuedAt: issuedAtFormatted,
        logoUrl,
        primaryColor,
        matricule,
        verifyUrl,
      });

      // B. Upload vers Cloudinary
      const fileName = `cert_${userId}_${trainingId}.pdf`;
      const certificateUrl = await uploadPDFToCloudinary(pdfUri, fileName);

      // C. Enregistrement Firestore Natif
      const finalDoc = {
        userId,
        trainingId,
        learnerName,
        formationTitle: formation?.title || "Formation",
        trainerName: formation?.trainerName || "Formateur",
        certificateUrl,
        issuedAt: firestore.FieldValue.serverTimestamp(), // ✅ Heure serveur
        brandColor: primaryColor,
        matricule,
        verifyUrl,
      };

      await db.collection("certificates").doc(certId).set(finalDoc);
      return { success: true, url: certificateUrl };
    } catch (error) {
      console.error("Erreur génération certificat:", error);
      throw error;
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
