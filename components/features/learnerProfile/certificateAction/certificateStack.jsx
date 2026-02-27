import { memo } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { CertificateEligible } from "./certificateEligible";
import { CertificateLocked } from "./certificateLocked";
import { CertificateReady } from "./certificateReady";
import { TrainingSelector } from "./certificatTrainingSelector";
import { EmptyState } from "./emptyState";

export const CertificateStateRenderer = memo(function CertificateStateRenderer({
  selectedTraining,
  trainings, // ← ajoute cette prop
  onSelectTraining, // ← ajoute cette prop
  certificate,
  eligible,
  generating,
  error,
  onGenerate,
}) {
  let content = null;

  if (!selectedTraining) {
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
      {/* SÉLECTEUR — visible seulement si plusieurs formations */}
      {trainings?.length > 1 && (
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
