import { db } from "@/components/lib/firebase";
import axios from "axios";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { generateCertificatePDF } from "../../../helpers/generateLearnerCertificate";

const CLOUDINARY_CLOUD_NAME = "dhpbglioz";
const CLOUDINARY_UPLOAD_PRESET = "edutrack_unsigned";

// ☁️ Fonction interne pour l'upload vers Cloudinary
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

  // 1️⃣ Écouter en temps réel si le certificat existe déjà
  useEffect(() => {
    if (!userId || !trainingId) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "certificates", certId), (snap) => {
      if (snap.exists()) {
        setCertificate({ id: snap.id, ...snap.data() });
      } else {
        setCertificate(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [userId, trainingId]);

  // 2️⃣ Vérifier l'éligibilité (Progression 100% + Quiz réussis)
  useEffect(() => {
    if (!userId || !trainingId || certificate) {
      setEligible(false);
      return;
    }

    const checkEligibility = async () => {
      setChecking(true);
      try {
        // A. Récupérer tous les modules
        const modulesSnap = await getDocs(
          collection(db, "formations", trainingId, "modules"),
        );
        const modules = modulesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        if (modules.length === 0) {
          setEligible(false);
          return;
        }

        // B. Récupérer la progression de l'utilisateur
        const progressSnap = await getDocs(
          query(
            collection(db, "userProgress"),
            where("userId", "==", userId),
            where("trainingId", "==", trainingId),
          ),
        );
        const completedLessonIds = progressSnap.docs.map(
          (d) => d.data().lessonId,
        );

        // C. Vérifier les leçons par module
        let allLessonsCompleted = true;
        for (const module of modules) {
          const lessonsSnap = await getDocs(
            collection(
              db,
              "formations",
              trainingId,
              "modules",
              module.id,
              "lessons",
            ),
          );
          const lessonIds = lessonsSnap.docs.map((d) => d.id);
          const moduleComplete = lessonIds.every((id) =>
            completedLessonIds.includes(id),
          );

          if (!moduleComplete) {
            allLessonsCompleted = false;
            break;
          }
        }

        if (!allLessonsCompleted) {
          setEligible(false);
          return;
        }

        // D. Vérifier les Quiz (Optionnel selon si le module en possède un)
        const quizResultsSnap = await getDocs(
          query(
            collection(db, "quizResults"),
            where("userId", "==", userId),
            where("trainingId", "==", trainingId),
            where("passed", "==", true),
          ),
        );
        const passedModuleIds = quizResultsSnap.docs.map(
          (d) => d.data().moduleId,
        );

        let allQuizPassed = true;
        for (const module of modules) {
          const quizSnap = await getDocs(
            collection(
              db,
              "formations",
              trainingId,
              "modules",
              module.id,
              "quiz",
            ),
          );
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

  // 3️⃣ Génération du certificat avec Branding Formateur
  const generateCertificate = async () => {
    if (!eligible || generating || certificate) return;

    try {
      setGenerating(true);

      // --- RÉCUPÉRATION DU BRANDING ---
      let logoUrl = null;
      let primaryColor = "#2563EB"; // Bleu EduTrack par défaut

      if (formation?.trainerId) {
        const trainerSnap = await getDoc(doc(db, "users", formation.trainerId));
        if (trainerSnap.exists()) {
          const trainerData = trainerSnap.data();
          logoUrl = trainerData.certificateLogo || null;
          primaryColor = trainerData.certificateColor || "#2563EB";
        }
      }

      const issuedAt = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // --- GÉNÉRATION PDF ---
      const pdfUri = await generateCertificatePDF({
        learnerName,
        formationTitle: formation?.title || "Formation",
        trainerName: formation?.trainerName || "Formateur",
        issuedAt,
        logoUrl,
        primaryColor,
      });

      // --- UPLOAD VERS CLOUDINARY ---
      const fileName = `cert_${userId}_${trainingId}.pdf`;
      const certificateUrl = await uploadPDFToCloudinary(pdfUri, fileName);

      // --- SAUVEGARDE DANS FIRESTORE ---
      await setDoc(doc(db, "certificates", certId), {
        userId,
        trainingId,
        learnerName,
        formationTitle: formation?.title || "Formation",
        trainerName: formation?.trainerName || "Formateur",
        certificateUrl,
        issuedAt: serverTimestamp(),
        brandColor: primaryColor,
      });
    } catch (error) {
      console.error("Erreur lors de la création du certificat:", error);
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
