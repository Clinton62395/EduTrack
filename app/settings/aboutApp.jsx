import { router } from "expo-router";
import {
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  Mail,
  MessageCircle,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react-native";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ms } from "../../components/ui/theme";

const APP_VERSION = "1.0.0";
const SUPPORT_EMAIL = "billydoumbouay5210@gmail.com";
const TAGLINE = "Formez. Progressez. Certifiez.";

// ─────────────────────────────────────────
// 🧩 MAIN SCREEN
// ─────────────────────────────────────────
export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ChevronLeft size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>À propos</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* HERO */}
          <HeroSection />

          {/* MISSION */}
          <MissionSection />

          {/* FEATURES */}
          <FeaturesSection />

          {/* ACTIONS */}
          <ActionsSection />

          {/* LEGAL */}
          <LegalSection />

          {/* FOOTER */}
          <FooterSection />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 HERO
// ─────────────────────────────────────────
function HeroSection() {
  return (
    <View style={styles.hero}>
      {/* Logo */}
      <View style={styles.logoOuter}>
        <View style={styles.logoInner}>
          {/* SVG-style logo using Views */}
          <View style={styles.logoHexagon}>
            <BookOpen size={32} color="white" />
          </View>
        </View>
        <View style={styles.logoRing1} />
        <View style={styles.logoRing2} />
      </View>

      <Text style={styles.appName}>EduTrack</Text>
      <Text style={styles.tagline}>{TAGLINE}</Text>

      {/* Version badge */}
      <View style={styles.versionBadge}>
        <View style={styles.versionDot} />
        <Text style={styles.versionText}>Version {APP_VERSION}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 MISSION
// ─────────────────────────────────────────
function MissionSection() {
  return (
    <View style={styles.missionCard}>
      <View style={styles.missionAccent} />
      <Text style={styles.missionTitle}>Notre Mission</Text>
      <Text style={styles.missionText}>
        EduTrack connecte formateurs et apprenants dans un espace dédié à
        l'apprentissage structuré. Notre plateforme simplifie la gestion des
        formations, suit la progression en temps réel et certifie les réussites
        de chaque apprenant.
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 FEATURES
// ─────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      color: "#2563EB",
      bg: "#EFF6FF",
      title: "Formations structurées",
      desc: "Modules, leçons et contenus organisés par vos formateurs",
    },
    {
      icon: TrendingUp,
      color: "#10B981",
      bg: "#F0FDF4",
      title: "Progression en temps réel",
      desc: "Suivez votre avancement leçon par leçon",
    },
    {
      icon: Award,
      color: "#7C3AED",
      bg: "#F5F3FF",
      title: "Certificats officiels",
      desc: "Obtenez un certificat PDF à la fin de chaque formation",
    },
    {
      icon: Users,
      color: "#EA580C",
      bg: "#FFF7ED",
      title: "Gestion des présences",
      desc: "Système de code d'accès pour confirmer votre présence",
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>FONCTIONNALITÉS</Text>
      <View style={styles.featuresGrid}>
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </View>
    </View>
  );
}

function FeatureCard({ icon: Icon, color, bg, title, desc }) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIconBox, { backgroundColor: bg }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 ACTIONS
// ─────────────────────────────────────────
function ActionsSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>SUPPORT & AVIS</Text>
      <View style={styles.actionsCard}>
        <ActionRow
          icon={Star}
          iconColor="#F59E0B"
          iconBg="#FFFBEB"
          title="Noter l'application"
          subtitle="Votre avis nous aide à grandir"
          onPress={() => Linking.openURL("https://play.google.com/store")}
          showArrow
        />

        <View style={styles.actionDivider} />

        <ActionRow
          icon={Mail}
          iconColor="#2563EB"
          iconBg="#EFF6FF"
          title="Contacter le support"
          subtitle={SUPPORT_EMAIL}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          showArrow
        />

        <View style={styles.actionDivider} />

        <ActionRow
          icon={MessageCircle}
          iconColor="#10B981"
          iconBg="#F0FDF4"
          title="Signaler un problème"
          subtitle="Aidez-nous à améliorer EduTrack"
          onPress={() => router.push("/settings/report")}
          showArrow
        />
      </View>
    </View>
  );
}

function ActionRow({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  showArrow,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.actionRow}
    >
      <View style={[styles.actionIconBox, { backgroundColor: iconBg }]}>
        <Icon size={18} color={iconColor} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {showArrow && <ChevronRight size={16} color="#CBD5E1" />}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────
// 🧩 LEGAL
// ─────────────────────────────────────────
function LegalSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>LÉGAL</Text>
      <View style={styles.legalCard}>
        <TouchableOpacity
          style={styles.legalRow}
          onPress={() =>
            Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=CGU EduTrack`)
          }
          activeOpacity={0.7}
        >
          <Shield size={15} color="#64748B" />
          <Text style={styles.legalText}>
            Conditions Générales d&apos;Utilisation
          </Text>
          <ExternalLink size={13} color="#CBD5E1" />
        </TouchableOpacity>

        <View style={styles.legalDivider} />

        <TouchableOpacity
          style={styles.legalRow}
          // Dans LegalSection — remplace le mailto: par l'URL réelle
          onPress={() =>
            Linking.openURL("https://edutrack-verify.vercel.app/privacy")
          }
          activeOpacity={0.7}
        >
          <Shield size={15} color="#64748B" />
          <Text style={styles.legalText}>Politique de Confidentialité</Text>
          <ExternalLink size={13} color="#CBD5E1" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 FOOTER
// ─────────────────────────────────────────
function FooterSection() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerHeartRow}>
        <Text style={styles.footerText}>Fait avec </Text>
        <Heart size={13} color="#EF4444" fill="#EF4444" />
        <Text style={styles.footerText}> en Guinée</Text>
      </View>
      <Text style={styles.footerCopy}>
        © {new Date().getFullYear()} EduTrack · Tous droits réservés
      </Text>
      <Text style={styles.footerVersion}>v{APP_VERSION}</Text>
    </View>
  );
}

// ─────────────────────────────────────────
// 🎨 STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scroll: {
    paddingBottom: ms(40),
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: ms(16),
    paddingVertical: ms(12),
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: ms(8),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: ms(2) },
    }),
  },
  backBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(10),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: ms(17),
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  // HERO
  hero: {
    alignItems: "center",
    paddingVertical: ms(40),
    paddingHorizontal: ms(24),
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  logoOuter: {
    width: ms(100),
    height: ms(100),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: ms(20),
    position: "relative",
  },
  logoInner: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(24),
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOpacity: 0.4,
        shadowRadius: ms(20),
        shadowOffset: { width: 0, height: ms(8) },
      },
      android: { elevation: ms(8) },
    }),
  },
  logoHexagon: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoRing1: {
    position: "absolute",
    width: ms(96),
    height: ms(96),
    borderRadius: ms(28),
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.2)",
  },
  logoRing2: {
    position: "absolute",
    width: ms(110),
    height: ms(110),
    borderRadius: ms(32),
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.08)",
  },
  appName: {
    fontSize: ms(32),
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -1,
    marginBottom: ms(6),
  },
  tagline: {
    fontSize: ms(15),
    color: "#64748B",
    fontWeight: "400",
    letterSpacing: 0.3,
    marginBottom: ms(16),
  },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
    backgroundColor: "#F1F5F9",
    paddingHorizontal: ms(12),
    paddingVertical: ms(5),
    borderRadius: ms(20),
  },
  versionDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: "#10B981",
  },
  versionText: {
    fontSize: ms(12),
    fontWeight: "600",
    color: "#475569",
  },

  // MISSION
  missionCard: {
    margin: ms(20),
    backgroundColor: "white",
    borderRadius: ms(16),
    padding: ms(20),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: ms(10),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: ms(2) },
    }),
  },
  missionAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: ms(3),
    backgroundColor: "#2563EB",
  },
  missionTitle: {
    fontSize: ms(13),
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: ms(10),
    marginTop: ms(4),
  },
  missionText: {
    fontSize: ms(14),
    color: "#475569",
    lineHeight: ms(22),
    fontWeight: "400",
  },

  // SECTION
  section: {
    paddingHorizontal: ms(20),
    marginBottom: ms(8),
  },
  sectionLabel: {
    fontSize: ms(10),
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1.5,
    marginBottom: ms(10),
    marginLeft: ms(4),
  },

  // FEATURES
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ms(12),
  },
  featureCard: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: ms(14),
    padding: ms(14),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: ms(8),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: ms(2) },
    }),
  },
  featureIconBox: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(11),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: ms(10),
  },
  featureTitle: {
    fontSize: ms(13),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: ms(4),
    lineHeight: ms(17),
  },
  featureDesc: {
    fontSize: ms(11),
    color: "#64748B",
    lineHeight: ms(16),
  },

  // ACTIONS
  actionsCard: {
    backgroundColor: "white",
    borderRadius: ms(16),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: ms(10),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: ms(2) },
    }),
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(14),
    padding: ms(16),
  },
  actionDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: ms(16),
  },
  actionIconBox: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(12),
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: ms(2),
  },
  actionSubtitle: {
    fontSize: ms(12),
    color: "#64748B",
  },

  // LEGAL
  legalCard: {
    backgroundColor: "white",
    borderRadius: ms(16),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: ms(8),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: ms(1) },
    }),
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(12),
    padding: ms(16),
  },
  legalDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: ms(16),
  },
  legalText: {
    flex: 1,
    fontSize: ms(13),
    color: "#374151",
    fontWeight: "500",
  },

  // FOOTER
  footer: {
    alignItems: "center",
    paddingVertical: ms(32),
    gap: ms(6),
  },
  footerHeartRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: ms(13),
    color: "#94A3B8",
  },
  footerCopy: {
    fontSize: ms(12),
    color: "#CBD5E1",
    fontWeight: "500",
  },
  footerVersion: {
    fontSize: ms(11),
    color: "#E2E8F0",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});
