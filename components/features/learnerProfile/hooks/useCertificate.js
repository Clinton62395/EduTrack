import { db } from "@/components/lib/firebase";
import axios from "axios";
import {
    collection,
    doc,
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

/**
 * Uploade un fichier PDF local vers Cloudinary (endpoint raw).
 *
 * @param {string} fileUri - URI local du PDF (file:///...)
 * @param {string} fileName - Nom du fichier
 * @returns {Promise<string>} URL sécurisée Cloudinary
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
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data.secure_url;
}

/**
 * Hook de gestion du certificat d'un apprenant pour une formation.
 *
 * Conditions de délivrance :
 * - Toutes les leçons de tous les modules sont complétées
 * - Tous les quiz de tous les modules sont réussis (passed: true)
 *
 * Structure Firestore :
 * certificates/{userId}_{trainingId}
 *   - userId, trainingId
 *   - learnerName, formationTitle, trainerName
 *   - certificateUrl (Cloudinary)
 *   - issuedAt (timestamp)
 *
 * @param {string} userId
 * @param {string} trainingId
 * @param {Object} formation - Données de la formation (title, trainerName...)
 * @param {string} learnerName - Nom de l'apprenant
 */
export function useCertificate(userId, trainingId, formation, learnerName) {
  const [certificate, setCertificate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(true);

  const certId = `${userId}_${trainingId}`;

  // ─────────────────────────────────────────
  // 📡 ÉCOUTER SI LE CERTIFICAT EXISTE DÉJÀ
  // ─────────────────────────────────────────
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

  // ─────────────────────────────────────────
  // ✅ VÉRIFIER L'ÉLIGIBILITÉ
  // Leçons complétées + Quiz réussis
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!userId || !trainingId || certificate) {
      // Déjà certifié → pas besoin de vérifier
      setEligible(false);
      return;
    }

    const checkEligibility = async () => {
      try {
        // 1. Récupérer tous les modules de la formation
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

        // 2. Récupérer toutes les leçons complétées par l'apprenant
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

        // 3. Vérifier que toutes les leçons de chaque module sont complétées
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

        // 4. Vérifier que tous les quiz sont réussis
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

        const allQuizPassed = modules.every((m) =>
          passedModuleIds.includes(m.id),
        );

        setEligible(allLessonsCompleted && allQuizPassed);
      } catch (error) {
        console.error("Erreur vérification éligibilité:", error);
        setEligible(false);
      }
    };

    checkEligibility();
  }, [userId, trainingId, certificate]);

  // ─────────────────────────────────────────
  // 🎓 GÉNÉRER LE CERTIFICAT
  // ─────────────────────────────────────────
  const generateCertificate = async () => {
    if (!eligible || generating || certificate) return;

    try {
      setGenerating(true);

      const issuedAt = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // 1. Générer le PDF localement
      const pdfUri = await generateCertificatePDF({
        learnerName,
        formationTitle: formation?.title || "Formation",
        trainerName: formation?.trainerName || "Formateur",
        issuedAt,
      });

      // 2. Uploader sur Cloudinary
      const fileName = `certificat_${userId}_${trainingId}_${Date.now()}.pdf`;
      const certificateUrl = await uploadPDFToCloudinary(pdfUri, fileName);

      // 3. Sauvegarder dans Firestore
      await setDoc(doc(db, "certificates", certId), {
        userId,
        trainingId,
        learnerName,
        formationTitle: formation?.title || "Formation",
        trainerName: formation?.trainerName || "Formateur",
        certificateUrl,
        issuedAt: serverTimestamp(),
      });

      // Le listener onSnapshot met à jour `certificate` automatiquement
    } catch (error) {
      console.error("Erreur génération certificat:", error);
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  return {
    certificate,
    eligible,
    generating,
    loading,
    generateCertificate,
  };
}
