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

// ─────────────────────────────────────────
export function CertificateReady({ certificate }) {
  const handleDownload = async () => {
    try {
      // Ouvre directement dans le navigateur — plus fiable
      const supported = await Linking.canOpenURL(certificate.certificateUrl);
      if (supported) {
        await Linking.openURL(certificate.certificateUrl);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleShare = async () => {
    try {
      // Partage l'URL directement sans télécharger
      const { Share } = await import("react-native");
      await Share.share({
        message: `Mon certificat de formation : ${certificate.certificateUrl}`,
        url: certificate.certificateUrl, // iOS seulement
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
    marginBottom: 20,
    marginTop: 8,
    position: "relative",
  },
  heroBadgeOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 6 },
    }),
  },
  heroBadgeInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  sparkleTop: {
    position: "absolute",
    top: 0,
    right: "28%",
  },
  sparkleBottom: {
    position: "absolute",
    bottom: 10,
    left: "28%",
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },

  // CARTE CERTIFICAT
  certCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
  certCardAccent: {
    height: 4,
    backgroundColor: "#2563EB",
  },
  certCardBody: {
    padding: 20,
  },
  certCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  certCardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  certCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 20,
  },
  certCardSub: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  certDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 16,
  },
  certCardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  certMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },
  certMetaLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginBottom: 2,
  },
  certMetaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  // ACTIONS
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
  actionButtonPrimaryText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  actionButtonSecondaryText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
});
