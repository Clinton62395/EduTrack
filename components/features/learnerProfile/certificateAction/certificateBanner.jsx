import { useBestCertificate } from "@/components/features/learnerProfile/hooks/useBestCertificate";
import { useLearnerTrainings } from "@/components/features/learnerProfile/hooks/useLearnerTrainings";
import { useRouter } from "expo-router";
import { Award, ChevronRight, Lock, Sparkles } from "lucide-react-native";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─────────────────────────────────────────
// 🧩 CERTIFICATE BANNER
// Composant autonome — gère ses propres données
// ─────────────────────────────────────────
export function CertificateBanner({ userId, userName }) {
  const router = useRouter();
  const { myTrainings, loading: trainingsLoading } =
    useLearnerTrainings(userId);
  const {
    status,
    bestFormation,
    loading: certLoading,
  } = useBestCertificate(userId, myTrainings);

  const loading = trainingsLoading || certLoading;

  const handlePress = () => {
    router.push("/(learner-stack)/my-trainings/certificate");
  };

  // ── Loading state
  if (loading) {
    return (
      <View style={styles.bannerWrapper}>
        <View style={[styles.banner, styles.bannerLoading]}>
          <View style={styles.bannerContent}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.loadingText}>
              Vérification des certificats...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ── Pas de formations
  if (!myTrainings?.length) return null;

  const isObtained = status === "obtained";
  const isReady = status === "eligible";

  const config = isObtained
    ? {
        bg: "#EFF6FF",
        border: "#BFDBFE",
        iconBg: "#DBEAFE",
        iconColor: "#2563EB",
        badge: "#2563EB",
        badgeBg: "#DBEAFE",
        accentColor: "#2563EB",
      }
    : isReady
      ? {
          bg: "#F0FDF4",
          border: "#BBF7D0",
          iconBg: "#DCFCE7",
          iconColor: "#10B981",
          badge: "#10B981",
          badgeBg: "#DCFCE7",
          accentColor: "#10B981",
        }
      : {
          bg: "#F8FAFC",
          border: "#E2E8F0",
          iconBg: "#F1F5F9",
          iconColor: "#94A3B8",
          badge: "#94A3B8",
          badgeBg: "#F1F5F9",
          accentColor: null,
        };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={styles.bannerWrapper}
    >
      <View
        style={[
          styles.banner,
          { backgroundColor: config.bg, borderColor: config.border },
        ]}
      >
        {/* Accent top */}
        {config.accentColor && (
          <View
            style={[
              styles.bannerAccent,
              { backgroundColor: config.accentColor },
            ]}
          />
        )}

        <View style={styles.bannerContent}>
          {/* Icône */}
          <View
            style={[styles.bannerIconBox, { backgroundColor: config.iconBg }]}
          >
            {isObtained ? (
              <Sparkles size={22} color={config.iconColor} />
            ) : isReady ? (
              <Award size={22} color={config.iconColor} />
            ) : (
              <Lock size={22} color={config.iconColor} />
            )}
          </View>

          {/* Texte */}
          <View style={styles.bannerText}>
            <View style={styles.bannerTitleRow}>
              <Text style={[styles.bannerTitle, { color: config.iconColor }]}>
                {isObtained
                  ? "Certificat obtenu ✓"
                  : isReady
                    ? "Prêt à générer 🎓"
                    : "Certificat verrouillé"}
              </Text>
              <View
                style={[
                  styles.bannerBadge,
                  { backgroundColor: config.badgeBg },
                ]}
              >
                <Text style={[styles.bannerBadgeText, { color: config.badge }]}>
                  {isObtained ? "Disponible" : isReady ? "Nouveau" : "Bloqué"}
                </Text>
              </View>
            </View>
            <Text style={styles.bannerSub} numberOfLines={1}>
              {isObtained
                ? bestFormation?.title || "Formation complétée"
                : isReady
                  ? "Appuyez pour générer votre certificat"
                  : "Complétez toutes les leçons et quiz"}
            </Text>
          </View>

          <ChevronRight size={18} color={config.iconColor} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────
// 🎨 STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  bannerWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  banner: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 3 },
    }),
  },
  bannerLoading: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  bannerAccent: {
    height: 3,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 8,
  },
  bannerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerText: {
    flex: 1,
    gap: 4,
  },
  bannerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  bannerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  bannerSub: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
});
