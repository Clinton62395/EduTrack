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
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!userId || !trainingId || certificate) {
      setEligible(false);
      return;
    }

    const checkEligibility = async () => {
      try {
        // 1. Tous les modules de la formation
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

        // 2. Leçons complétées par l'apprenant
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

        // 3. Toutes les leçons de chaque module complétées
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

        // 4. Quiz réussis — OPTIONNEL par module
        //    Si le module n'a pas de quiz → condition ignorée pour ce module
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
          // Vérifier si ce module a des questions de quiz
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

          const hasQuiz = quizSnap.size > 0;

          // Si le module a un quiz et qu'il n'est pas réussi → bloquant
          if (hasQuiz && !passedModuleIds.includes(module.id)) {
            allQuizPassed = false;
            break;
          }
        }

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
