import { Box, Text } from "@/components/ui/theme";
import { Image } from "expo-image";
import {
    Award,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    XCircle,
} from "lucide-react-native";
import { StyleSheet, TouchableOpacity } from "react-native";

export function FormationCard({ formation, expanded, onToggle }) {
  // Couleur de la barre de progression selon le taux
  const progressColor =
    formation.avgCompletion >= 75
      ? "#10B981" // Vert si > 75%
      : formation.avgCompletion >= 50
        ? "#F59E0B" // Orange si > 50%
        : "#EF4444"; // Rouge sinon

  return (
    <Box
      backgroundColor="white"
      borderRadius="xl"
      marginBottom="m"
      overflow="hidden"
      style={styles.card}
    >
      {/* ── En-tête cliquable ── */}
      <TouchableOpacity activeOpacity={0.8} onPress={onToggle}>
        <Box padding="m">
          {/* Titre + flèche */}
          <Box flexDirection="row" alignItems="center" gap="m">
            <Box
              width={44}
              height={44}
              borderRadius="m"
              backgroundColor="secondaryBackground"
              justifyContent="center"
              alignItems="center"
            >
              <BookOpen size={22} color="#2563EB" />
            </Box>

            <Box flex={1}>
              <Text variant="body" fontWeight="bold" numberOfLines={1}>
                {formation.title}
              </Text>
              <Text variant="caption" color="muted">
                {formation.totalLearners} apprenant
                {formation.totalLearners > 1 ? "s" : ""} •{" "}
                {formation.totalLessons} leçon
                {formation.totalLessons > 1 ? "s" : ""}
              </Text>
            </Box>

            {/* % moyen + flèche */}
            <Box alignItems="flex-end" marginRight="s">
              <Text
                variant="body"
                fontWeight="bold"
                style={{ color: progressColor }}
              >
                {formation.avgCompletion}%
              </Text>
              <Text variant="caption" color="muted">
                moy.
              </Text>
            </Box>

            <ChevronDown
              size={18}
              color="#6B7280"
              style={{
                transform: [{ rotate: expanded ? "180deg" : "0deg" }],
              }}
            />
          </Box>

          {/* Barre de progression globale */}
          <Box
            height={6}
            backgroundColor="secondaryBackground"
            borderRadius="rounded"
            overflow="hidden"
            marginTop="m"
          >
            <Box
              height={6}
              borderRadius="rounded"
              style={{
                width: `${formation.avgCompletion}%`,
                backgroundColor: progressColor,
              }}
            />
          </Box>

          {/* Stats rapides */}
          <Box flexDirection="row" gap="m" marginTop="m">
            <Box flexDirection="row" alignItems="center" gap="xs">
              <Award size={14} color="#F59E0B" />
              <Text variant="caption" color="muted">
                {formation.certifiedCount} certifié
                {formation.certifiedCount > 1 ? "s" : ""}
              </Text>
            </Box>
          </Box>
        </Box>
      </TouchableOpacity>

      {/* ── DRILL-DOWN : Liste des apprenants ── */}
      {/* Visible seulement si la carte est "expanded" */}
      {expanded && (
        <Box borderTopWidth={1} borderTopColor="border">
          {formation.learners.length === 0 ? (
            <Box padding="m" alignItems="center">
              <Text variant="caption" color="muted">
                Aucun apprenant inscrit.
              </Text>
            </Box>
          ) : (
            formation.learners.map((learner) => (
              <LearnerProgressRow key={learner.userId} learner={learner} />
            ))
          )}
        </Box>
      )}
    </Box>
  );
}

function LearnerProgressRow({ learner }) {
  // Couleur selon sa progression personnelle
  const color =
    learner.completionPercent >= 75
      ? "#10B981"
      : learner.completionPercent >= 50
        ? "#F59E0B"
        : "#EF4444";

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      paddingHorizontal="m"
      paddingVertical="s"
      borderBottomWidth={1}
      borderBottomColor="border"
      gap="m"
    >
      {/* Avatar ou initiale */}
      <Box
        width={36}
        height={36}
        borderRadius="rounded"
        backgroundColor="secondaryBackground"
        justifyContent="center"
        alignItems="center"
        overflow="hidden"
      >
        {learner.photoURL ? (
          <Image
            source={{ uri: learner.photoURL || learner.avatar }}
            style={{ width: 36, height: 36 }}
            contentFit="cover"
          />
        ) : (
          <Text variant="caption" fontWeight="bold" color="primary">
            {/* Première lettre du nom */}
            {learner.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </Box>

      {/* Nom + barre de progression */}
      <Box flex={1}>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          marginBottom="xs"
        >
          <Text variant="caption" fontWeight="bold" numberOfLines={1} flex={1}>
            {learner.name}
          </Text>
          <Text variant="caption" style={{ color }} fontWeight="bold">
            {learner.completionPercent}%
          </Text>
        </Box>

        {/* Mini barre de progression individuelle */}
        <Box
          height={4}
          backgroundColor="secondaryBackground"
          borderRadius="rounded"
          overflow="hidden"
        >
          <Box
            height={4}
            borderRadius="rounded"
            style={{
              width: `${learner.completionPercent}%`,
              backgroundColor: color,
            }}
          />
        </Box>

        {/* Leçons complétées */}
        <Text variant="caption" color="muted" marginTop="xs">
          {learner.lessonsCompleted}/{learner.totalLessons} leçons
        </Text>
      </Box>

      {/* Badges quiz + certificat */}
      <Box gap="xs" alignItems="center">
        {/* Quiz réussi ? */}
        {learner.quizPassed ? (
          <CheckCircle2 size={16} color="#10B981" />
        ) : (
          <XCircle size={16} color="#D1D5DB" />
        )}
        {/* Certifié ? */}
        <Award size={16} color={learner.certified ? "#F59E0B" : "#D1D5DB"} />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
});
