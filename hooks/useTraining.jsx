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
import { useCallback, useEffect, useMemo, useState } from "react";
import { sendPublicationNotification } from "../components/helpers/useNotificationforLearnerAttendance";

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
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

  // ─────────────────────────────────────────
  // 📡 REALTIME LISTENER (source of truth)
  //    – replaces both the old onSnapshot AND the
  //      duplicate fetchTrainings useEffects.
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

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

  // ─────────────────────────────────────────
  // 🔄 MANUAL REFRESH
  //    Forces a fresh one-shot read when the user
  //    pulls-to-refresh (onSnapshot may be cached).
  // ─────────────────────────────────────────
  const refreshTrainings = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "formations"), where("trainerId", "==", user.uid)),
      );
      const data = snap.docs.map((d) => {
        const formation = { id: d.id, ...d.data() };
        return {
          ...formation,
          status: formation.status || "draft",
          sessionStatus: getSessionStatus(formation),
        };
      });
      setTrainings(data);
    } catch (error) {
      showSnack("Erreur lors du rafraîchissement", "error");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // ─────────────────────────────────────────
  // 📊 FILTERED LIST
  //    "all"      → tout sauf archived
  //    "archived" → uniquement archived
  //    autre      → filtre exact sur status
  // ─────────────────────────────────────────
  const filteredTrainings = useMemo(() => {
    if (filter === "all")
      return trainings.filter((t) => t.status !== "archived");
    return trainings.filter((t) => t.status === filter);
  }, [trainings, filter]);

  // ─────────────────────────────────────────
  // 📈 STATS
  // ─────────────────────────────────────────
  const stats = useMemo(
    () => ({
      all: trainings.filter((t) => t.status !== "archived").length,
      draft: trainings.filter((t) => t.status === "draft").length,
      published: trainings.filter((t) => t.status === "published").length,
      archived: trainings.filter((t) => t.status === "archived").length,
    }),
    [trainings],
  );

  // ─────────────────────────────────────────
  // 🛡️ PUBLICATION READINESS CHECK
  // ─────────────────────────────────────────
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
        reason: `Leçons manquantes dans : ${missingLessons.map((c) => c.moduleTitle).join(", ")}`,
      };
    if (missingQuiz.length > 0)
      return {
        ready: false,
        reason: `Quiz manquants dans : ${missingQuiz.map((c) => c.moduleTitle).join(", ")}`,
      };

    return { ready: true };
  };

  // ─────────────────────────────────────────
  // 🚀 CRUD ACTIONS
  // ─────────────────────────────────────────
  const createTraining = async (trainingData) => {
    try {
      await addDoc(collection(db, "formations"), {
        ...trainingData,
        trainerId: user.uid,
        status: "draft",
        codeActive: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showSnack("Formation créée avec succès");
      return true;
    } catch {
      showSnack("Impossible de créer la formation", "error");
      return false;
    }
  };

  const updateTraining = async (id, data) => {
    try {
      const { status, ...safeData } = data; // prevent manual status override
      await updateDoc(doc(db, "formations", id), {
        ...safeData,
        updatedAt: serverTimestamp(),
      });
      showSnack("Formation mise à jour");
      return true;
    } catch {
      showSnack("Erreur de mise à jour", "error");
      return false;
    }
  };

  const publishTraining = async (id) => {
    try {
      const { ready, reason } = await checkPublicationReadiness(id);
      if (!ready) return { success: false, reason };

      await updateDoc(doc(db, "formations", id), {
        status: "published",
        codeActive: true,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const formationSnap = await getDoc(doc(db, "formations", id));
      const data = formationSnap.data();
      const participants = (data?.participants || []).map((p) =>
        typeof p === "string" ? p : p.uid,
      );

      if (participants.length > 0) {
        sendPublicationNotification(
          participants,
          data.title,
          data.invitationCode,
        ).catch(console.error);
      }

      showSnack("Formation publiée !");
      return { success: true };
    } catch {
      showSnack("Erreur publication", "error");
      return {
        success: false,
        reason: "Erreur technique lors de la publication.",
      };
    }
  };

  const unpublishTraining = async (id) => {
    try {
      await updateDoc(doc(db, "formations", id), {
        status: "draft",
        codeActive: false,
        updatedAt: serverTimestamp(),
      });
      showSnack("Formation remise en brouillon.");
      return true;
    } catch {
      showSnack("Erreur lors de la modification", "error");
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
    } catch {
      showSnack("Erreur archivage", "error");
      return false;
    }
  };

  const unarchiveTraining = async (id) => {
    try {
      await updateDoc(doc(db, "formations", id), {
        status: "draft",
        unarchivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showSnack("Formation restaurée.");
      return true;
    } catch {
      showSnack("Erreur restauration", "error");
      return false;
    }
  };

  const deleteTraining = async (id) => {
    try {
      const snap = await getDoc(doc(db, "formations", id));
      if (!snap.exists()) return { success: false };

      const data = snap.data();
      if (getSessionStatus(data) === "ongoing") {
        showSnack("Impossible de supprimer une session en cours.", "error");
        return { success: false };
      }
      if ((data.participants?.length || 0) > 0) {
        showSnack(
          "Cette formation contient des élèves. Archivez-la.",
          "warning",
        );
        return { success: false, suggest: "archive" };
      }

      await deleteDoc(doc(db, "formations", id));
      showSnack("Formation supprimée.");
      return { success: true };
    } catch {
      showSnack("Erreur suppression", "error");
      return { success: false };
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
    refreshTrainings,
  };
}
