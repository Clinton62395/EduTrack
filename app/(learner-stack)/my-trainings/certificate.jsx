import { useAuth } from "@/components/constants/authContext";
import { CertificateStateRenderer } from "@/components/features/learnerProfile/certificateAction/certificateStack";
import { useCertificate } from "@/components/features/learnerProfile/hooks/useCertificate";
import { useLearnerTrainings } from "@/components/features/learnerProfile/hooks/useLearnerTrainings";
import { MyLoader } from "@/components/ui/loader";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function CertificateScreen() {
  const { user } = useAuth();
  const { myTrainings, loading: trainingsLoading } = useLearnerTrainings(
    user?.uid,
  );
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [error, setError] = useState(null);

  // Sélectionne la première formation dès que les données arrivent
  useEffect(() => {
    if (myTrainings.length > 0 && !selectedTraining) {
      setSelectedTraining(myTrainings[0]);
    }
  }, [myTrainings]);

  // Reset error quand la formation change
  useEffect(() => {
    setError(null);
  }, [selectedTraining?.id]);

  const { certificate, eligible, generating, loading, generateCertificate } =
    useCertificate(
      user?.uid,
      selectedTraining?.id,
      selectedTraining,
      user?.name || "Apprenant",
    );

  const handleGenerate = useCallback(async () => {
    try {
      setError(null);
      await generateCertificate();
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  }, [generateCertificate]);

  // Loading tant que les trainings chargent OU selectedTraining pas encore défini
  if (
    trainingsLoading ||
    loading ||
    (myTrainings.length > 0 && !selectedTraining)
  ) {
    return <MyLoader message="Vérification du certificat..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <CertificateStateRenderer
          selectedTraining={selectedTraining}
          trainings={myTrainings} // ← ajoute
          onSelectTraining={setSelectedTraining} // ← ajoute
          certificate={certificate}
          eligible={eligible}
          generating={generating}
          error={error}
          onGenerate={handleGenerate}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
});
