import { useAuth } from "@/components/constants/authContext";
import { db } from "@/components/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { sendPublicationNotification } from "../components/helpers/useNotificationforLearnerAttendance";

function getSessionStatus(training) {
  const now = new Date();
  const start = training.startDate ? new Date(training.startDate) : null;
  const end = training.endDate ? new Date(training.endDate) : null;
  if (!start || !end || isNaN(start) || isNaN(end)) return "planned";
  if (now > end) return "completed";
  if (now >= start) return "ongoing";
  return "planned";
}

export function useTrainings() {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState("success");

  const showSnack = (message, type = "success") => {
    setSnackMessage(message);
    setSnackType(type);
    setSnackVisible(true);
  };

  const dismissSnack = () => setSnackVisible(false);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(
      query(collection(db, "formations"), where("trainerId", "==", user.uid)),
      (snapshot) => {
        const data = snapshot.docs.map((d) => {
          const formation = { id: d.id, ...d.data() };
          return {
            ...formation,
            status: formation.status || "draft",
            sessionStatus: getSessionStatus(formation),
          };
        });
        setTrainings(data);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur chargement formations:", error);
        showSnack("Erreur lors du chargement des formations", "error");
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user?.uid]);

  const filteredTrainings = useMemo(() => {
    if (filter === "all") return trainings;
    return trainings.filter((t) => t.status === filter);
  }, [trainings, filter]);

  const stats = useMemo(
    () => ({
      all: trainings.length,
      draft: trainings.filter((t) => t.status === "draft").length,
      published: trainings.filter((t) => t.status === "published").length,
      archived: trainings.filter((t) => t.status === "archived").length,
    }),
    [trainings],
  );

  const checkPublicationReadiness = async (trainingId) => {
    const modulesSnap = await getDocs(
      collection(db, "formations", trainingId, "modules"),
    );
    if (modulesSnap.empty)
      return {
        ready: false,
        reason: "Ajoutez au moins un module avant de publier.",
      };

    const checks = await Promise.all(
      modulesSnap.docs.map(async (moduleDoc) => {
        const [lessonsSnap, quizSnap] = await Promise.all([
          getDocs(
            collection(
              db,
              "formations",
              trainingId,
              "modules",
              moduleDoc.id,
              "lessons",
            ),
          ),
          getDocs(
            collection(
              db,
              "formations",
              trainingId,
              "modules",
              moduleDoc.id,
              "quiz",
            ),
          ),
        ]);
        return {
          moduleTitle: moduleDoc.data().title || `Module ${moduleDoc.id}`,
          hasLessons: !lessonsSnap.empty,
          hasQuiz: !quizSnap.empty,
        };
      }),
    );

    const missingLessons = checks.filter((c) => !c.hasLessons);
    const missingQuiz = checks.filter((c) => !c.hasQuiz);
    if (missingLessons.length > 0)
      return {
        ready: false,
        reason: `Ces modules n'ont aucune leçon : ${missingLessons.map((c) => c.moduleTitle).join(", ")}`,
      };
    if (missingQuiz.length > 0)
      return {
        ready: false,
        reason: `Ces modules n'ont pas de quiz : ${missingQuiz.map((c) => c.moduleTitle).join(", ")}`,
      };
    return { ready: true };
  };

  // ─────────────────────────────────────────
  // 🚀 PUBLIER + notification aux participants
  // ─────────────────────────────────────────
  const publishTraining = async (id) => {
    try {
      const { ready, reason } = await checkPublicationReadiness(id);
      if (!ready) {
        showSnack(reason, "error");
        return false;
      }

      await updateDoc(doc(db, "formations", id), {
        status: "published",
        codeActive: true,
        publishedAt: serverTimestamp(),
      });

      // ✅ Notification aux participants déjà inscrits
      // (cas où la formation était draft avec des inscrits anticipés)
      const formationSnap = await getDoc(doc(db, "formations", id));
      if (formationSnap.exists()) {
        const data = formationSnap.data();
        const participants = (data.participants || []).map((p) =>
          typeof p === "string" ? p : p.uid,
        );
        if (participants.length > 0) {
          sendPublicationNotification(
            participants,
            data.title,
            data.invitationCode,
          ).catch(console.error); // fire and forget
        }
      }

      showSnack("Formation publiée ! Le code d'invitation est actif.");
      return true;
    } catch (error) {
      console.error("Erreur publication:", error);
      showSnack("Impossible de publier la formation", "error");
      return false;
    }
  };

  const unpublishTraining = async (id) => {
    try {
      await updateDoc(doc(db, "formations", id), {
        status: "draft",
        codeActive: false,
        updatedAt: serverTimestamp(),
      });
      showSnack("Formation dépubliée. Le code d'invitation est désactivé.");
      return true;
    } catch (error) {
      console.error("Erreur dépublication:", error);
      showSnack("Impossible de dépublier la formation", "error");
      return false;
    }
  };

  const archiveTraining = async (id) => {
    try {
      await updateDoc(doc(db, "formations", id), {
        status: "archived",
        codeActive: false,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showSnack("Formation archivée.");
      return true;
    } catch (error) {
      console.error("Erreur archivage:", error);
      showSnack("Impossible d'archiver la formation", "error");
      return false;
    }
  };

  const unarchiveTraining = async (id) => {
    try {
      await updateDoc(doc(db, "formations", id), {
        status: "draft",
        codeActive: false,
        unarchivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showSnack(
        "Formation restaurée en brouillon. Republiez-la quand elle est prête.",
      );
      return true;
    } catch (error) {
      console.error("Erreur désarchivage:", error);
      showSnack("Impossible de restaurer la formation", "error");
      return false;
    }
  };

  const updateTraining = async (id, data) => {
    try {
      await updateDoc(doc(db, "formations", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      showSnack("Formation mise à jour avec succès");
      return true;
    } catch (error) {
      console.error("Erreur update formation:", error);
      showSnack("Impossible de mettre à jour la formation", "error");
      return false;
    }
  };

  const createTraining = async (trainingData) => {
    try {
      await addDoc(collection(db, "formations"), {
        ...trainingData,
        status: "draft",
        codeActive: false,
        createdAt: serverTimestamp(),
      });
      showSnack("Formation créée avec succès");
      return true;
    } catch (error) {
      console.error("Erreur création formation:", error);
      showSnack("Impossible de créer la formation", "error");
      return false;
    }
  };

  const deleteTraining = async (id) => {
    try {
      await deleteDoc(doc(db, "formations", id));
      showSnack("Formation supprimée avec succès");
      return true;
    } catch (error) {
      console.error("Erreur suppression formation:", error);
      showSnack("Impossible de supprimer la formation", "error");
      return false;
    }
  };

  return {
    trainings,
    filteredTrainings,
    stats,
    loading,
    filter,
    setFilter,
    createTraining,
    updateTraining,
    publishTraining,
    unpublishTraining,
    archiveTraining,
    unarchiveTraining,
    deleteTraining,
    snackVisible,
    snackMessage,
    snackType,
    dismissSnack,
  };
}
