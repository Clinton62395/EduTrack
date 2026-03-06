import { useAuth } from "@/components/constants/authContext";
import { CertificateStateRenderer } from "@/components/features/learnerProfile/certificateAction/certificateStack";
import { useCertificate } from "@/components/features/learnerProfile/hooks/useCertificate";
import { useLearnerTrainings } from "@/components/features/learnerProfile/hooks/useLearnerTrainings";
import { MyLoader } from "@/components/ui/loader";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CertificateScreen() {
  const { user } = useAuth();
  const { myTrainings, loading: trainingsLoading } = useLearnerTrainings(
    user?.uid,
  );

  const [activeTab, setActiveTab] = useState("ready"); // 'ready' ou 'done'
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [error, setError] = useState(null);

  // 1. Filtrage ultra-sécurisé des formations
  const readyList = useMemo(() => {
    return myTrainings.filter((t) => {
      const completed = Number(t.lessonsCompleted) || 0;
      const total = Number(t.totalLessons) || 0;
      // Une formation est prête si : Total > 0 ET Complété >= Total ET pas encore de certificat
      return total > 0 && completed >= total && !t.certificateUrl;
    });
  }, [myTrainings]);

  const doneList = useMemo(() => {
    return myTrainings.filter((t) => t.certificateUrl);
  }, [myTrainings]);

  const currentList = activeTab === "ready" ? readyList : doneList;

  // 2. Gestion de la sélection automatique
  useEffect(() => {
    if (currentList.length > 0) {
      setSelectedTraining(currentList[0]);
    } else {
      setSelectedTraining(null);
    }
  }, [activeTab, currentList.length]);

  // 3. Hook de gestion du certificat spécifique
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

  const handleGenerate = useCallback(async () => {
    try {
      setError(null);
      await generateCertificate();
      setActiveTab("done"); // Bascule vers l'archive après succès
    } catch (err) {
      setError("Erreur lors de la génération. Réessayez.");
    }
  }, [generateCertificate]);

  if (trainingsLoading)
    return <MyLoader message="Chargement de vos formations..." />;

  return (
    <View style={styles.container}>
      {/* ONGLETS */}
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
            MES CERTIFICATS ({doneList.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {currentList.length > 0 ? (
          <CertificateStateRenderer
            selectedTraining={selectedTraining}
            trainings={currentList}
            onSelectTraining={setSelectedTraining}
            certificate={certificate}
            eligible={eligible}
            checking={checking}
            generating={generating}
            error={error}
            onGenerate={handleGenerate}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === "ready"
                ? "Aucune formation n'est terminée à 100% pour le moment."
                : "Vous n'avez pas encore de certificats enregistrés."}
            </Text>
          </View>
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
  // Styles Onglet "Prêt" (Vert)
  activeTabReady: { backgroundColor: "#DCFCE7" },
  activeTabTextReady: { color: "#10B981" },
  // Styles Onglet "Fait" (Bleu)
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
