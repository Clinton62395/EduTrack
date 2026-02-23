import { useAuth } from "@/components/constants/authContext";
import { useCertificate } from "@/components/features/learnerProfile/hooks/useCertificate";
import { useLearnerTrainings } from "@/components/features/learnerProfile/hooks/useLearnerTrainings";
import { MyLoader } from "@/components/ui/loader";
import { Box, Button, Text } from "@/components/ui/theme";
import * as Linking from "expo-linking";
import * as Sharing from "expo-sharing";
import {
    Award,
    CheckCircle2,
    Clock,
    Download,
    Lock,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CertificateScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { myTrainings, loading: trainingsLoading } = useLearnerTrainings(
    user?.uid,
  );

  // Formation active de l'apprenant
  const trainingId = user?.enrolledTrainings?.[0];
  const formation = myTrainings?.[0];

  const { certificate, eligible, generating, loading, generateCertificate } =
    useCertificate(user?.uid, trainingId, formation, user?.name || "Apprenant");

  const [error, setError] = useState(null);

  if (loading || trainingsLoading) {
    return <MyLoader message="Vérification du certificat..." />;
  }

  // ─────────────────────────────────────────
  // 🎓 CERTIFICAT DÉJÀ GÉNÉRÉ
  // ─────────────────────────────────────────
  if (certificate) {
    return (
      <Box
        flex={1}
        backgroundColor="secondaryBackground"
        style={{ paddingTop: insets.top }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, alignItems: "center" }}
        >
          {/* Badge succès */}
          <Box
            width={120}
            height={120}
            borderRadius="rounded"
            backgroundColor="#EFF6FF"
            justifyContent="center"
            alignItems="center"
            marginTop="xl"
            marginBottom="l"
            style={styles.badge}
          >
            <Award size={60} color="#2563EB" />
          </Box>

          <Text variant="title" textAlign="center" marginBottom="s">
            Félicitations ! 🎉
          </Text>

          <Text
            variant="body"
            color="muted"
            textAlign="center"
            marginBottom="xl"
          >
            Vous avez obtenu votre certificat pour la formation
          </Text>

          {/* Carte certificat */}
          <Box
            backgroundColor="white"
            borderRadius="xl"
            padding="l"
            width="100%"
            borderWidth={2}
            borderColor="primary"
            marginBottom="xl"
            style={styles.card}
          >
            <Box
              flexDirection="row"
              alignItems="center"
              gap="m"
              marginBottom="m"
            >
              <Award size={24} color="#2563EB" />
              <Box flex={1}>
                <Text variant="body" fontWeight="bold">
                  {certificate.formationTitle}
                </Text>
                <Text variant="caption" color="muted">
                  Certificat de réussite
                </Text>
              </Box>
              <CheckCircle2 size={24} color="#10B981" />
            </Box>

            <Box
              height={1}
              backgroundColor="secondaryBackground"
              marginBottom="m"
            />

            <Box flexDirection="row" justifyContent="space-between">
              <Box>
                <Text variant="caption" color="muted">
                  Apprenant
                </Text>
                <Text variant="body" fontWeight="bold">
                  {certificate.learnerName}
                </Text>
              </Box>
              <Box alignItems="flex-end">
                <Text variant="caption" color="muted">
                  Formateur
                </Text>
                <Text variant="body" fontWeight="bold">
                  {certificate.trainerName}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Boutons */}
          <Box width="100%" gap="m">
            <Button
              title="Télécharger le PDF"
              variant="primary"
              icon={<Download size={20} color="white" />}
              iconPosition="right"
              onPress={() => Linking.openURL(certificate.certificateUrl)}
            />
            <Button
              title="Partager le certificat"
              variant="outline"
              onPress={async () => {
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                  await Sharing.shareAsync(certificate.certificateUrl);
                } else {
                  Linking.openURL(certificate.certificateUrl);
                }
              }}
            />
          </Box>
        </ScrollView>
      </Box>
    );
  }

  // ─────────────────────────────────────────
  // ✅ ÉLIGIBLE — peut générer
  // ─────────────────────────────────────────
  if (eligible) {
    return (
      <Box
        flex={1}
        backgroundColor="secondaryBackground"
        justifyContent="center"
        alignItems="center"
        padding="xl"
        style={{ paddingTop: insets.top }}
      >
        <Box
          width={120}
          height={120}
          borderRadius="rounded"
          backgroundColor="#EFF6FF"
          justifyContent="center"
          alignItems="center"
          marginBottom="l"
          style={styles.badge}
        >
          <Award size={60} color="#2563EB" />
        </Box>

        <Text variant="title" textAlign="center" marginBottom="s">
          Formation complétée ! 🎓
        </Text>

        <Text variant="body" color="muted" textAlign="center" marginBottom="xl">
          Vous avez validé toutes les leçons et tous les quiz. Votre certificat
          est prêt à être généré.
        </Text>

        {error && (
          <Text color="danger" textAlign="center" marginBottom="m">
            {error}
          </Text>
        )}

        <Button
          title={
            generating ? "Génération en cours..." : "Générer mon certificat"
          }
          variant="primary"
          loading={generating}
          disabled={generating}
          onPress={async () => {
            try {
              setError(null);
              await generateCertificate();
            } catch {
              setError("Erreur lors de la génération. Réessayez.");
            }
          }}
          icon={<Award size={20} color="white" />}
          iconPosition="right"
        />
      </Box>
    );
  }

  // ─────────────────────────────────────────
  // 🔒 PAS ENCORE ÉLIGIBLE
  // ─────────────────────────────────────────
  return (
    <Box
      flex={1}
      backgroundColor="secondaryBackground"
      justifyContent="center"
      alignItems="center"
      padding="xl"
      style={{ paddingTop: insets.top }}
    >
      <Box
        width={120}
        height={120}
        borderRadius="rounded"
        backgroundColor="secondaryBackground"
        justifyContent="center"
        alignItems="center"
        marginBottom="l"
      >
        <Lock size={60} color="#D1D5DB" />
      </Box>

      <Text variant="title" textAlign="center" marginBottom="s" color="muted">
        Certificat verrouillé
      </Text>

      <Text
        variant="body"
        color="muted"
        textAlign="center"
        marginBottom="xl"
        lineHeight={24}
      >
        Pour obtenir votre certificat, vous devez terminer toutes les leçons et
        réussir tous les quiz de la formation.
      </Text>

      {/* Checklist */}
      <Box
        backgroundColor="white"
        borderRadius="xl"
        padding="l"
        width="100%"
        style={styles.card}
      >
        <ChecklistItem label="Toutes les leçons complétées" done={false} />
        <ChecklistItem label="Tous les quiz réussis (≥ 70%)" done={false} />
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────
// 🧩 CHECKLIST ITEM
// ─────────────────────────────────────────
function ChecklistItem({ label, done }) {
  return (
    <Box flexDirection="row" alignItems="center" gap="m" paddingVertical="s">
      {done ? (
        <CheckCircle2 size={20} color="#10B981" />
      ) : (
        <Clock size={20} color="#F59E0B" />
      )}
      <Text variant="body" color={done ? "success" : "text"}>
        {label}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  badge: {
    elevation: 4,
    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
});
