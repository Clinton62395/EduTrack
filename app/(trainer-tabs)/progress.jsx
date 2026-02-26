import { useAuth } from "@/components/constants/authContext";
import { useTrainerProgress } from "@/components/features/trainerProfile/hooks/useTrainerProgress";
import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import { Award, TrendingUp, Users } from "lucide-react-native";
import { useState } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FormationCard } from "../../components/features/trainerProfile/progressAction/formationCard";
import {
  EmptyState,
  StatBox,
} from "../../components/features/trainerProfile/progressAction/progressEmptyState";

// ═══════════════════════════════════════════════════════
// 🧩 SCREEN PRINCIPAL
// ═══════════════════════════════════════════════════════
export default function TrainerProgressScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Récupère toutes les formations avec la progression calculée
  const { formationsProgress, loading } = useTrainerProgress(user?.uid);

  // Garde en mémoire quelle formation est "ouverte" (drill-down)
  // null = toutes fermées, "formationId" = celle-là est ouverte
  const [expandedFormation, setExpandedFormation] = useState(null);

  if (loading) return <MyLoader message="Calcul des progressions..." />;

  return (
    <Box
      flex={1}
      backgroundColor="secondaryBackground"
      style={{ paddingTop: insets.top }}
    >
      {/* ─── HEADER ─── */}
      <Box
        backgroundColor="white"
        paddingHorizontal="l"
        paddingVertical="m"
        borderBottomWidth={1}
        borderBottomColor="border"
      >
        <Text variant="title">Progression</Text>
        <Text variant="caption" color="muted">
          Suivi de vos apprenants
        </Text>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {formationsProgress.length === 0 ? (
          // ── Aucune formation ──
          <EmptyState />
        ) : (
          <>
            {/* ── Stats globales toutes formations ── */}
            <GlobalSummary formations={formationsProgress} />

            {/* ── Une carte par formation ── */}
            <Text
              variant="body"
              fontWeight="bold"
              marginTop="l"
              marginBottom="m"
            >
              Mes formations ({formationsProgress.length})
            </Text>

            {formationsProgress.map((formation) => (
              <FormationCard
                key={formation.id}
                formation={formation}
                expanded={expandedFormation === formation.id}
                onToggle={() =>
                  setExpandedFormation(
                    expandedFormation === formation.id
                      ? null // Ferme si déjà ouvert
                      : formation.id, // Ouvre sinon
                  )
                }
              />
            ))}
          </>
        )}
      </ScrollView>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════
// 📊 RÉSUMÉ GLOBAL — chiffres clés toutes formations
// ═══════════════════════════════════════════════════════
function GlobalSummary({ formations }) {
  // Calcul du total d'apprenants (toutes formations confondues)
  const totalLearners = formations.reduce((acc, f) => acc + f.totalLearners, 0);

  // Moyenne globale de complétion
  const globalAvg =
    formations.length > 0
      ? Math.round(
          formations.reduce((acc, f) => acc + f.avgCompletion, 0) /
            formations.length,
        )
      : 0;

  // Total des certificats délivrés
  const totalCerts = formations.reduce((acc, f) => acc + f.certifiedCount, 0);

  return (
    <Box flexDirection="row" gap="s">
      {/* Apprenants */}
      <StatBox
        icon={<Users size={20} color="#2563EB" />}
        value={totalLearners}
        label="Apprenants"
        color="successLight"
      />
      {/* Progression moyenne */}
      <StatBox
        icon={<TrendingUp size={20} color="#10B981" />}
        value={`${globalAvg}%`}
        label="Moy. complétion"
        color="successLight"
      />
      {/* Certificats */}
      <StatBox
        icon={<Award size={20} color="#F59E0B" />}
        value={totalCerts}
        label="Certificats"
        color="dangerLight"
      />
    </Box>
  );
}
