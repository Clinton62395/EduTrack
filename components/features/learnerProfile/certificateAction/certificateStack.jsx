import { memo } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { CheckingState } from "./certificateCheckingState";
import { CertificateEligible } from "./certificateEligible";
import { CertificateReady } from "./certificateReady";
import { TrainingSelector } from "./certificatTrainingSelector";
import { EmptyState } from "./emptyState";

export const CertificateStateRenderer = memo(function CertificateStateRenderer({
  selectedTraining,
  trainings,
  onSelectTraining,
  certificate,
  eligible,
  generating,
  checking,
  error,
  onGenerate,
}) {
  let content = null;

  if (checking) {
    content = <CheckingState />;
  } else if (!selectedTraining) {
    content = <EmptyState />;
  } else if (certificate) {
    // Cas : Onglet "Mes certificats"
    content = <CertificateReady certificate={certificate} />;
  } else if (eligible) {
    // Cas : Onglet "À générer"
    content = (
      <CertificateEligible
        error={error}
        generating={generating}
        onGenerate={onGenerate}
      />
    );
  }

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      {/* On n'affiche le sélecteur que s'il y a plusieurs formations dans l'onglet actif */}
      {trainings?.length > 1 && !checking && (
        <TrainingSelector
          trainings={trainings}
          selected={selectedTraining}
          onSelect={onSelectTraining}
        />
      )}
      {content}
    </Animated.View>
  );
});
