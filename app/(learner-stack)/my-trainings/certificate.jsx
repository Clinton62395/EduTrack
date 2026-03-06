import { useAuth } from "@/components/constants/authContext";
import { CertificateStateRenderer } from "@/components/features/learnerProfile/certificateAction/certificateStack";
import { EmptyState } from "@/components/features/learnerProfile/certificateAction/emptyState";
import { useBestCertificate } from "@/components/features/learnerProfile/hooks/useBestCertificate";
import { useCertificate } from "@/components/features/learnerProfile/hooks/useCertificate";
import { useLearnerTrainings } from "@/components/features/learnerProfile/hooks/useLearnerTrainings";
import { db } from "@/components/lib/firebase";
import { MyLoader } from "@/components/ui/loader";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CertificateScreen() {
  const { initialTrainingId } = useLocalSearchParams();
  const { user } = useAuth();

  const { myTrainings, loading: trainingsLoading } = useLearnerTrainings(
    user?.uid,
  );
  const {
    status,
    bestFormation,
    loading: certChecking,
  } = useBestCertificate(user?.uid, myTrainings);

  const [activeTab, setActiveTab] = useState("ready");
  const [selectedTraining, setSelectedTraining] = useState(null); // onglet "ready"
  const [selectedCertificate, setSelectedCertificate] = useState(null); // onglet "done"
  const [error, setError] = useState(null);

  // ── Onglet "À GÉNÉRER" : formations éligibles
  const readyList = useMemo(() => {
    if (status === "eligible" && bestFormation) return [bestFormation];
    return [];
  }, [status, bestFormation]);

  // ── Onglet "MES CERTIFICATS" : temps réel Firestore
  const [doneCertificates, setDoneCertificates] = useState([]);
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(
      query(collection(db, "certificates"), where("userId", "==", user.uid)),
      (snap) => {
        setDoneCertificates(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );
    return () => unsub();
  }, [user?.uid]);

  // ── Sélection automatique onglet "ready"
  useEffect(() => {
    if (activeTab !== "ready") return;
    if (readyList.length > 0) {
      const preselected = readyList.find((t) => t.id === initialTrainingId);
      setSelectedTraining(preselected || readyList[0]);
    } else {
      setSelectedTraining(null);
    }
  }, [activeTab, readyList.length, initialTrainingId]);

  // ── Sélection automatique onglet "done"
  useEffect(() => {
    if (activeTab !== "done") return;
    setSelectedCertificate(
      doneCertificates.length > 0 ? doneCertificates[0] : null,
    );
  }, [activeTab, doneCertificates.length]);

  // ── Hook génération (onglet "ready" uniquement)
  const {
    certificate,
    eligible,
    generating,
    loading: certLoading,
    generateCertificate,
    checking,
  } = useCertificate(
    user?.uid,
    selectedTraining?.id,
    selectedTraining,
    user?.name || "Apprenant",
  );

  // ── Bascule vers "done" dès que le certificat est créé
  useEffect(() => {
    if (certificate) setActiveTab("done");
  }, [certificate]);

  const handleGenerate = useCallback(async () => {
    try {
      setError(null);
      await generateCertificate();
    } catch (err) {
      setError("Erreur lors de la génération. Réessayez.");
    }
  }, [generateCertificate]);

  if (trainingsLoading || certChecking) {
    return <MyLoader message="Vérification de vos formations..." />;
  }

  const isDone = activeTab === "done";
  const currentList = isDone ? doneCertificates : readyList;

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab("ready")}
          style={[styles.tab, activeTab === "ready" && styles.activeTabReady]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "ready" && styles.activeTabTextReady,
            ]}
          >
            À GÉNÉRER ({readyList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("done")}
          style={[styles.tab, activeTab === "done" && styles.activeTabDone]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "done" && styles.activeTabTextDone,
            ]}
          >
            MES CERTIFICATS ({doneCertificates.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {currentList.length > 0 ? (
          <CertificateStateRenderer
            selectedTraining={isDone ? selectedCertificate : selectedTraining}
            trainings={currentList}
            onSelectTraining={
              isDone ? setSelectedCertificate : setSelectedTraining
            }
            // Onglet "done" → on passe directement le certificat comme prop certificate
            // Onglet "ready" → useCertificate gère certificate
            certificate={isDone ? selectedCertificate : certificate}
            eligible={eligible}
            checking={isDone ? false : checking}
            generating={generating}
            error={error}
            onGenerate={handleGenerate}
          />
        ) : (
          <EmptyState
            title={isDone ? "Aucun certificat" : "Aucune formation terminée"}
            subtitle={
              isDone
                ? "Vous n'avez pas encore de certificats enregistrés."
                : "Complétez toutes les leçons et quiz d'une formation pour débloquer votre certificat."
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 8,
    gap: 8,
    margin: 28,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10 },
  tabText: { fontSize: 12, fontWeight: "700", color: "#94A3B8" },
  activeTabReady: { backgroundColor: "#DCFCE7" },
  activeTabTextReady: { color: "#10B981" },
  activeTabDone: { backgroundColor: "#DBEAFE" },
  activeTabTextDone: { color: "#2563EB" },
  scroll: { flexGrow: 1, padding: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: { color: "#64748B", textAlign: "center", fontSize: 14 },
});
