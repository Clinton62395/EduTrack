import { memo } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { CheckingState } from "./certificateCheckingState";
import { CertificateEligible } from "./certificateEligible";
import { CertificateLocked } from "./certificateLocked";
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
  checking, // ← On utilise cet état pour le sélecteur aussi
  error,
  onGenerate,
}) {
  let content = null;

  // On détermine le contenu principal
  if (checking) {
    content = <CheckingState />;
  } else if (!selectedTraining) {
    content = <EmptyState />;
  } else if (certificate) {
    content = <CertificateReady certificate={certificate} />;
  } else if (eligible) {
    content = (
      <CertificateEligible
        error={error}
        generating={generating}
        onGenerate={onGenerate}
      />
    );
  } else {
    content = <CertificateLocked />;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(200)}
    >
      {/* AJOUT DE LA CONDITION !checking : 
          Le sélecteur disparaît pendant l'analyse pour laisser toute la place au loader 
      */}
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
