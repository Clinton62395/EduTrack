import { db } from "@/components/lib/firebase";
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
} from "@react-native-firebase/firestore";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  generateCertificatePDF,
  generateMatricule,
} from "../../../helpers/generateLearnerCertificate";
import { sendTrainerNotification } from "../../../helpers/useNotificationforLearnerAttendance";

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
    const certRef = doc(db, "certificates", certId);
    const unsub = onSnapshot(
      certRef,
      (snap) => {
        setCertificate(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      (err) => {
        console.error("Snapshot error:", err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [userId, trainingId]);

  // 2️⃣ VÉRIFICATION DE L'ÉLIGIBILITÉ
  useEffect(() => {
    if (!userId || !trainingId || certificate || loading) return;

    const checkEligibility = async () => {
      setChecking(true);
      try {
        const [modulesSnap, progressSnap, quizResultsSnap] = await Promise.all([
          getDocs(collection(db, "formations", trainingId, "modules")),
          getDocs(
            query(
              collection(db, "userProgress"),
              where("userId", "==", userId),
              where("trainingId", "==", trainingId),
            ),
          ),
          getDocs(
            query(
              collection(db, "quizResults"),
              where("userId", "==", userId),
              where("trainingId", "==", trainingId),
              where("passed", "==", true),
            ),
          ),
        ]);

        if (modulesSnap.empty) {
          setEligible(false);
          return;
        }

        const completedLessonIds = progressSnap.docs.map(
          (d) => d.data().lessonId,
        );
        const passedModuleIds = quizResultsSnap.docs.map(
          (d) => d.data().moduleId,
        );

        const allLessonsSnaps = await Promise.all(
          modulesSnap.docs.map((m) =>
            getDocs(
              collection(
                db,
                "formations",
                trainingId,
                "modules",
                m.id,
                "lessons",
              ),
            ),
          ),
        );
        const allQuizSnaps = await Promise.all(
          modulesSnap.docs.map((m) =>
            getDocs(
              collection(db, "formations", trainingId, "modules", m.id, "quiz"),
            ),
          ),
        );

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

  // 3️⃣ GÉNÉRATION ET SAUVEGARDE
  const generateCertificate = async () => {
    if (!eligible || generating || certificate) return;

    try {
      setGenerating(true);

      let logoUrl = null;
      let primaryColor = "#2563EB";

      if (formation?.trainerId) {
        const trainerSnap = await getDoc(doc(db, "users", formation.trainerId));
        if (trainerSnap.exists()) {
          const t = trainerSnap.data();
          logoUrl = t.certificateLogo || null;
          primaryColor = t.certificateColor || "#2563EB";
        }
      }

      const matricule = generateMatricule();
      const verifyUrl = `https://edutrack-verify.vercel.app/verify/${matricule}`;
      const issuedAtFormatted = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

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

      const fileName = `cert_${userId}_${trainingId}.pdf`;
      const certificateUrl = await uploadPDFToCloudinary(pdfUri, fileName);

      const finalDoc = {
        userId,
        trainingId,
        learnerName,
        formationTitle: formation?.title || "Formation",
        trainerName: formation?.trainerName || "Formateur",
        certificateUrl,
        issuedAt: serverTimestamp(),
        brandColor: primaryColor,
        matricule,
        verifyUrl,
      };

      await setDoc(doc(db, "certificates", certId), finalDoc);

      // ✅ Notifier le trainer — fire and forget
      if (formation?.trainerId) {
        sendTrainerNotification(formation.trainerId, "CERTIFICATE_GENERATED", {
          learnerName,
          trainingTitle: formation?.title || "la formation",
          trainingId,
          matricule,
        }).catch(console.error);
      }

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
