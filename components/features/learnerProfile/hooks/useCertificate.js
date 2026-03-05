import { db } from "@/components/lib/firebase";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  generateCertificatePDF,
  generateMatricule,
} from "../../../helpers/generateLearnerCertificate";
// firestore via db; FieldValue via firestore.FieldValue

const CLOUDINARY_CLOUD_NAME = "dhpbglioz";
const CLOUDINARY_UPLOAD_PRESET = "edutrack_unsigned";

async function uploadPDFToCloudinary(fileUri, fileName) {
  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    type: "application/pdf",
    name: fileName,
  });
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "Edutrack/Learner/Certificates");
  formData.append("resource_type", "auto");

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

  // 1️⃣ Écoute temps réel
  useEffect(() => {
    if (!userId || !trainingId) {
      setLoading(false);
      return;
    }
    const ref = db.collection("certificates").doc(certId);
    const unsub = ref.onSnapshot((snap) => {
      setCertificate(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return () => unsub();
  }, [userId, trainingId]);

  // 2️⃣ Vérification éligibilité
  useEffect(() => {
    if (!userId || !trainingId) return;
    if (certificate) return; // déjà obtenu → pas besoin de vérifier

    const checkEligibility = async () => {
      setChecking(true);
      try {
        const modulesSnap = await db
          .collection("formations")
          .doc(trainingId)
          .collection("modules")
          .get();
        const modules = modulesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        if (!modules.length) {
          setEligible(false);
          return;
        }

        const progressSnap = await db
          .collection("userProgress")
          .where("userId", "==", userId)
          .where("trainingId", "==", trainingId)
          .get();
        const completedLessonIds = progressSnap.docs.map(
          (d) => d.data().lessonId,
        );

        let allLessonsCompleted = true;
        for (const module of modules) {
          const lessonsSnap = await db
            .collection("formations")
            .doc(trainingId)
            .collection("modules")
            .doc(module.id)
            .collection("lessons")
            .get();
          const lessonIds = lessonsSnap.docs.map((d) => d.id);
          if (!lessonIds.every((id) => completedLessonIds.includes(id))) {
            allLessonsCompleted = false;
            break;
          }
        }
        if (!allLessonsCompleted) {
          setEligible(false);
          return;
        }

        const quizResultsSnap = await db
          .collection("quizResults")
          .where("userId", "==", userId)
          .where("trainingId", "==", trainingId)
          .where("passed", "==", true)
          .get();
        const passedModuleIds = quizResultsSnap.docs.map(
          (d) => d.data().moduleId,
        );

        let allQuizPassed = true;
        for (const module of modules) {
          const quizSnap = await db
            .collection("formations")
            .doc(trainingId)
            .collection("modules")
            .doc(module.id)
            .collection("quiz")
            .get();
          if (quizSnap.size > 0 && !passedModuleIds.includes(module.id)) {
            allQuizPassed = false;
            break;
          }
        }

        setEligible(allLessonsCompleted && allQuizPassed);
      } catch (error) {
        console.error("Erreur éligibilité:", error);
        setEligible(false);
      } finally {
        setChecking(false);
      }
    };

    checkEligibility();
  }, [userId, trainingId, certificate]);

  // 3️⃣ Génération avec matricule + QR
  const generateCertificate = async () => {
    if (!eligible || generating || certificate) return;

    try {
      setGenerating(true);

      // Branding formateur
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

      // ✅ Génère le matricule unique
      const matricule = generateMatricule();
      const verifyUrl = `https://edutrack.app/verify/${matricule}`;

      const issuedAt = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // ✅ Génère le PDF avec QR intégré
      const pdfUri = await generateCertificatePDF({
        learnerName,
        formationTitle: formation?.title || "Formation",
        trainerName: formation?.trainerName || "Formateur",
        issuedAt,
        logoUrl,
        primaryColor,
        matricule, // ← nouveau
        verifyUrl, // ← nouveau
      });

      // Upload Cloudinary
      const fileName = `cert_${userId}_${trainingId}.pdf`;
      const certificateUrl = await uploadPDFToCloudinary(pdfUri, fileName);

      // ✅ Sauvegarde avec matricule dans Firestore
      await setDoc(doc(db, "certificates", certId), {
        userId,
        trainingId,
        learnerName,
        formationTitle: formation?.title || "Formation",
        trainerName: formation?.trainerName || "Formateur",
        certificateUrl,
        issuedAt: serverTimestamp(),
        brandColor: primaryColor,
        matricule, // ← nouveau
        verifyUrl, // ← nouveau
      });
    } catch (error) {
      console.error("Erreur génération certificat:", error);
      alert("Une erreur est survenue lors de la génération du certificat.");
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
