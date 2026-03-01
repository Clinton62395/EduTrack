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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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
          onPress={() =>
            Linking.openURL(
              `mailto:${SUPPORT_EMAIL}?subject=Bug Report EduTrack`,
            )
          }
          showArrow
        />
      </View>
    </View>
  );
}

function ActionRow({ icon: Icon, iconColor, iconBg, title, subtitle, onPress, showArrow }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.actionRow}>
      <View style={[styles.actionIconBox, { backgroundColor: iconBg }]}>
        <Icon size={18} color={iconColor} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle} numberOfLines={1}>{subtitle}</Text>
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
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=CGU EduTrack`)}
          activeOpacity={0.7}
        >
          <Shield size={15} color="#64748B" />
          <Text style={styles.legalText}>Conditions Générales d'Utilisation</Text>
          <ExternalLink size={13} color="#CBD5E1" />
        </TouchableOpacity>

        <View style={styles.legalDivider} />

        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Politique confidentialité`)}
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
    paddingBottom: 40,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  // HERO
  hero: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  logoOuter: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#2563EB", shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 8 },
    }),
  },
  logoHexagon: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoRing1: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.2)",
  },
  logoRing2: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.08)",
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -1,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "400",
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  versionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  versionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },

  // MISSION
  missionCard: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  missionAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#2563EB",
  },
  missionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  missionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    fontWeight: "400",
  },

  // SECTION
  section: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },

  // FEATURES
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    lineHeight: 17,
  },
  featureDesc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
  },

  // ACTIONS
  actionsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  actionDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 16,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },

  // LEGAL
  legalCard: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 1 },
    }),
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  legalDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 16,
  },
  legalText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },

  // FOOTER
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 6,
  },
  footerHeartRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#94A3B8",
  },
  footerCopy: {
    fontSize: 12,
    color: "#CBD5E1",
    fontWeight: "500",
  },
  footerVersion: {
    fontSize: 11,
    color: "#E2E8F0",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});