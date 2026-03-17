import * as Linking from "expo-linking";
import {
  Award,
  CheckCircle2,
  Download,
  Share2,
  Sparkles,
} from "lucide-react-native";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { hs, ms, vs } from "../../../ui/theme";

// ─────────────────────────────────────────
export function CertificateReady({ certificate }) {
  const handleDownload = async () => {
    try {
      await Linking.openURL(certificate.certificateUrl);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleShare = async () => {
    try {
      const { Share } = await import("react-native");
      await Share.share({
        message: `Mon certificat de formation : ${certificate.certificateUrl}`,
        url: certificate.certificateUrl,
      });
    } catch (error) {
      console.error("Erreur partage:", error);
    }
  };
  return (
    <View>
      {/* Hero badge */}
      <View style={styles.heroBadgeContainer}>
        <View style={styles.heroBadgeOuter}>
          <View style={styles.heroBadgeInner}>
            <Award size={52} color="#2563EB" />
          </View>
        </View>
        <View style={styles.sparkleTop}>
          <Sparkles size={16} color="#F59E0B" />
        </View>
        <View style={styles.sparkleBottom}>
          <Sparkles size={12} color="#2563EB" />
        </View>
      </View>

      <Text style={styles.heroTitle}>Félicitations ! 🎉</Text>
      <Text style={styles.heroSub}>
        Vous avez obtenu votre certificat de réussite
      </Text>

      {/* Carte certificat */}
      <View style={styles.certCard}>
        {/* Bande bleue */}
        <View style={styles.certCardAccent} />

        <View style={styles.certCardBody}>
          <View style={styles.certCardHeader}>
            <View style={styles.certCardIconBox}>
              <Award size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.certCardTitle} numberOfLines={2}>
                {certificate.formationTitle}
              </Text>
              <Text style={styles.certCardSub}>Certificat de réussite</Text>
            </View>
            <CheckCircle2 size={22} color="#10B981" />
          </View>

          <View style={styles.certDivider} />

          <View style={styles.certCardMeta}>
            <View>
              <Text style={styles.certMetaLabel}>Apprenant</Text>
              <Text style={styles.certMetaValue}>
                {certificate.learnerName}
              </Text>
            </View>
            <View style={styles.certMetaDot} />
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.certMetaLabel}>Formateur</Text>
              <Text style={styles.certMetaValue}>
                {certificate.trainerName}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={handleDownload}
          style={styles.actionButtonPrimary}
          activeOpacity={0.85}
        >
          <Download size={18} color="white" />
          <Text style={styles.actionButtonPrimaryText}>Télécharger</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          style={styles.actionButtonSecondary}
          activeOpacity={0.85}
        >
          <Share2 size={18} color="#2563EB" />
          <Text style={styles.actionButtonSecondaryText}>Partager</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// 🎨 STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  heroBadgeContainer: {
    alignItems: "center",
    marginBottom: vs(8),
    marginTop: vs(8),
    position: "relative",
  },

  heroBadgeOuter: {
    width: hs(120),
    height: vs(120),
    borderRadius: ms(60),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOpacity: 0.25,
        shadowRadius: ms(20),
        shadowOffset: { width: 0, height: vs(8) },
      },
      android: { elevation: ms(6) },
    }),
  },

  heroBadgeInner: {
    width: hs(90),
    height: vs(90),
    borderRadius: ms(45),
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },

  sparkleTop: {
    position: "absolute",
    top: vs(0),
    right: "28%", // % OK → ne pas scaler
  },

  sparkleBottom: {
    position: "absolute",
    bottom: vs(10),
    left: "28%",
  },

  heroTitle: {
    fontSize: ms(24),
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: vs(8),
  },

  heroSub: {
    fontSize: ms(14),
    color: "#64748B",
    textAlign: "center",
    marginBottom: vs(28),
    lineHeight: vs(20),
  },

  // CARD
  certCard: {
    backgroundColor: "white",
    borderRadius: ms(20),
    overflow: "hidden",
    marginBottom: vs(24),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: ms(16),
        shadowOffset: { width: 0, height: vs(4) },
      },
      android: { elevation: ms(4) },
    }),
  },

  certCardAccent: {
    height: vs(4),
    backgroundColor: "#2563EB",
  },

  certCardBody: {
    padding: ms(20),
  },

  certCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: ms(12),
    marginBottom: vs(16),
  },

  certCardIconBox: {
    width: hs(40),
    height: vs(40),
    borderRadius: ms(12),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  certCardTitle: {
    fontSize: ms(15),
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: vs(20),
  },

  certCardSub: {
    fontSize: ms(12),
    color: "#94A3B8",
    marginTop: vs(2),
  },

  certDivider: {
    height: vs(1),
    backgroundColor: "#F1F5F9",
    marginBottom: vs(16),
  },

  certCardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  certMetaDot: {
    width: hs(4),
    height: vs(4),
    borderRadius: ms(2),
    backgroundColor: "#CBD5E1",
  },

  certMetaLabel: {
    fontSize: ms(11),
    color: "#94A3B8",
    fontWeight: "500",
    marginBottom: vs(2),
  },

  certMetaValue: {
    fontSize: ms(14),
    fontWeight: "700",
    color: "#0F172A",
  },

  // ACTIONS
  actionsRow: {
    flexDirection: "row",
    gap: ms(12),
  },

  actionButtonPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: ms(8),
    backgroundColor: "#2563EB",
    paddingVertical: vs(14),
    paddingHorizontal: ms(16),
    borderRadius: ms(14),
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOpacity: 0.3,
        shadowRadius: ms(8),
        shadowOffset: { width: 0, height: vs(4) },
      },
      android: { elevation: ms(4) },
    }),
  },

  actionButtonPrimaryText: {
    color: "white",
    fontSize: ms(14),
    fontWeight: "700",
  },

  actionButtonSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: ms(8),
    backgroundColor: "#EFF6FF",
    paddingVertical: vs(14),
    paddingHorizontal: ms(16),
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  actionButtonSecondaryText: {
    color: "#2563EB",
    fontSize: ms(14),
    fontWeight: "700",
  },
});
