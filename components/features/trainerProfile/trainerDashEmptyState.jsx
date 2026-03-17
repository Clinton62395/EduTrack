import {
  Award,
  BookOpen,
  Plus,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react-native";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { hs, ms, vs } from "../../ui/theme";
// ─────────────────────────────────────────
// ÉTAT VIDE — glassmorphisme
// ─────────────────────────────────────────
export function TrainerDashboardEmptyState({ onCreatePress, user }) {
  const [activeTip, setActiveTip] = useState(0);

  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  // ─────────────────────────────────────────
  // DONNÉES STATIQUES
  // ─────────────────────────────────────────
  const TIPS = [
    {
      id: "1",
      icon: BookOpen,
      color: "#2563EB",
      bg: "rgba(37,99,235,0.15)",
      title: "Structurez vos modules",
      desc: "Divisez votre formation en modules clairs avec des leçons progressives pour maximiser l'engagement.",
    },
    {
      id: "2",
      icon: Zap,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.15)",
      title: "Ajoutez des quiz",
      desc: "Les quiz valident les acquis et sont obligatoires pour délivrer un certificat officiel.",
    },
    {
      id: "3",
      icon: Users,
      color: "#10B981",
      bg: "rgba(16,185,129,0.15)",
      title: "Partagez le code",
      desc: "Une fois publiée, partagez le code d'invitation via WhatsApp ou email à vos apprenants.",
    },
    {
      id: "4",
      icon: Award,
      color: "#7C3AED",
      bg: "rgba(124,58,237,0.15)",
      title: "Certifiez vos élèves",
      desc: "Les apprenants ayant complété toutes les leçons et réussi les quiz reçoivent un certificat PDF officiel.",
    },
  ];

  const STEPS = [
    {
      number: "1",
      title: "Créez votre formation",
      desc: "Titre, description, dates et capacité.",
    },
    {
      number: "2",
      title: "Ajoutez modules & quiz",
      desc: "Organisez le contenu en modules avec leçons et quiz.",
    },
    {
      number: "3",
      title: "Publiez et invitez",
      desc: "Activez le code d'invitation pour vos apprenants.",
    },
  ];
  return (
    <ScrollView
      style={s.emptyRoot}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO SOMBRE ── */}
      <View style={s.heroBg}>
        <View style={s.glow1} />
        <View style={s.glow2} />
        <View style={s.glow3} />
        <View style={s.dotGrid} />

        <View style={s.heroContent}>
          {/* Badge */}
          <View style={s.greetingBadge}>
            <View style={s.greetingDot} />
            <Text style={s.greetingText}>
              Prêt à former, {user?.name?.split(" ")[0]} ?
            </Text>
          </View>

          <Text style={s.heroTitle}>
            Votre première{"\n"}formation vous attend
          </Text>
          <Text style={s.heroSub}>
            Créez votre contenu, invitez vos apprenants et délivrez des
            certificats officiels vérifiables.
          </Text>

          {/* CTA */}
          <TouchableOpacity
            onPress={onCreatePress}
            style={s.heroCTA}
            activeOpacity={0.85}
          >
            <Plus size={20} color="white" />
            <Text style={s.heroCTAText}>Créer ma première formation</Text>
          </TouchableOpacity>

          <Text style={s.heroHint}>Gratuit · Prêt en quelques minutes</Text>
        </View>
      </View>

      {/* ── STATS PLACEHOLDER ── */}
      <View style={s.statsSection}>
        <Text style={s.sectionLabel}>LA PLATEFORME EN CHIFFRES</Text>
        <View style={s.statsGrid}>
          {[
            {
              value: "120+",
              label: "Formations",
              color: "#2563EB",
              icon: BookOpen,
            },
            {
              value: "840+",
              label: "Apprenants",
              color: "#10B981",
              icon: Users,
            },
            {
              value: "320+",
              label: "Certifiés",
              color: "#F59E0B",
              icon: Award,
            },
            {
              value: "96%",
              label: "Satisfaction",
              color: "#7C3AED",
              icon: TrendingUp,
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <View
                key={i}
                style={[s.statBox, { width: (SCREEN_WIDTH - vs(40)) / 2 }]}
              >
                <View
                  style={[
                    s.statIconBox,
                    { backgroundColor: `${stat.color}18` },
                  ]}
                >
                  <Icon size={20} color={stat.color} />
                </View>
                <Text style={[s.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── CONSEILS — horizontal scroll ── */}
      <View style={s.tipsSection}>
        <Text style={s.sectionLabel}>CONSEILS POUR BIEN DÉMARRER</Text>
        <FlatList
          data={TIPS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40),
            );
            setActiveTip(index);
          }}
          renderItem={({ item }) => {
            const Icon = item.icon;
            return (
              <View style={[s.tipCard, { width: SCREEN_WIDTH - 40 }]}>
                <View style={[s.tipIconBox, { backgroundColor: item.bg }]}>
                  <Icon size={22} color={item.color} />
                </View>
                <Text style={s.tipTitle}>{item.title}</Text>
                <Text style={s.tipDesc}>{item.desc}</Text>
              </View>
            );
          }}
        />
        {/* Dots */}
        <View style={s.dotsRow}>
          {TIPS.map((_, i) => (
            <View key={i} style={[s.dot, i === activeTip && s.dotActive]} />
          ))}
        </View>
      </View>

      {/* ── ÉTAPES ── */}
      <View style={s.stepsSection}>
        <Text style={s.sectionLabel}>COMMENT ÇA MARCHE</Text>
        {STEPS.map((step, i) => (
          <View key={i} style={s.stepRow}>
            <View style={s.stepCircle}>
              <Text style={s.stepNumber}>{step.number}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.stepTitle}>{step.title}</Text>
              <Text style={s.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}

        {/* CTA final */}
        <TouchableOpacity
          onPress={onCreatePress}
          style={s.bottomCTA}
          activeOpacity={0.85}
        >
          <Plus size={18} color="white" />
          <Text style={s.bottomCTAText}>Commencer maintenant</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const s = StyleSheet.create({
  emptyRoot: { flex: 1, backgroundColor: "#F8FAFC" },

  // Hero
  heroBg: {
    backgroundColor: "#0A0F2E",
    minHeight: vs(380),
    overflow: "hidden",
    position: "relative",
  },
  glow1: {
    position: "absolute",
    width: vs(500),
    height: hs(500),
    borderRadius: ms(250),
    backgroundColor: "#2563EB",
    opacity: 0.12,
    top: hs(-200),
    left: hs(-100),
  },
  glow2: {
    position: "absolute",
    width: vs(400),
    height: hs(400),
    borderRadius: ms(200),
    backgroundColor: "#10B981",
    opacity: 0.08,
    bottom: vs(-150),
    right: hs(-80),
  },
  glow3: {
    position: "absolute",
    width: vs(300),
    height: hs(300),
    borderRadius: ms(150),
    backgroundColor: "#7C3AED",
    opacity: 0.07,
    top: ms(50),
    right: ms(200),
  },
  dotGrid: {
    position: "absolute",
    inset: 0,
    opacity: 0.04,
  },
  heroContent: { padding: ms(28), paddingBottom: ms(40) },
  greetingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(37,99,235,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: ms(12),
    paddingVertical: ms(5),
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.3)",
    marginBottom: vs(20),
  },
  greetingDot: {
    width: vs(7),
    height: hs(7),
    borderRadius: ms(4),
    backgroundColor: "#10B981",
  },
  greetingText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: ms(13),
    fontWeight: "500",
  },
  heroTitle: {
    fontSize: ms(32),
    fontWeight: "800",
    color: "white",
    lineHeight: ms(40),
    marginBottom: ms(12),
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    lineHeight: ms(22),
    marginBottom: vs(28),
  },
  heroCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: vs(10),
    backgroundColor: "#2563EB",
    paddingVertical: vs(15),
    paddingHorizontal: ms(22),
    borderRadius: ms(16),
    shadowColor: "#2563EB",
    shadowOpacity: 0.5,
    shadowRadius: ms(16),
    shadowOffset: { width: 0, height: hs(6) },
    elevation: 8,
    marginBottom: vs(12),
  },
  heroCTAText: { color: "white", fontSize: ms(16), fontWeight: "700", flex: 1 },
  heroHint: {
    color: "rgba(255,255,255,0.3)",
    fontSize: ms(12),
    textAlign: "center",
  },

  // Stats
  statsSection: { padding: 20, paddingBottom: 8 },
  sectionLabel: {
    fontSize: ms(10),
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1.5,
    marginBottom: vs(14),
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: {
    backgroundColor: "white",
    borderRadius: ms(16),
    padding: ms(16),
    alignItems: "center",
    gap: ms(6),
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: ms(8),
    elevation: 2,
  },
  statIconBox: {
    width: vs(40),
    height: hs(40),
    borderRadius: ms(12),
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: { fontSize: ms(24), fontWeight: "800" },
  statLabel: { fontSize: ms(12), color: "#94A3B8", fontWeight: "500" },

  // Tips
  tipsSection: { paddingHorizontal: 20, paddingBottom: 8 },
  tipCard: {
    backgroundColor: "white",
    borderRadius: ms(20),
    padding: ms(20),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: ms(10),
    elevation: 2,
  },
  tipIconBox: {
    width: vs(48),
    height: hs(48),
    borderRadius: ms(14),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  tipTitle: {
    fontSize: ms(15),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  tipDesc: { fontSize: ms(13), color: "#64748B", lineHeight: ms(20) },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: ms(14),
  },
  dot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: "#E2E8F0",
  },
  dotActive: { width: 18, backgroundColor: "#2563EB" },

  // Steps
  stepsSection: { padding: ms(20) },
  stepRow: {
    flexDirection: "row",
    gap: ms(16),
    marginBottom: ms(20),
    alignItems: "flex-start",
  },
  stepCircle: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stepNumber: { color: "white", fontWeight: "800", fontSize: ms(15) },
  stepTitle: {
    fontSize: ms(14),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: ms(3),
  },
  stepDesc: { fontSize: ms(13), color: "#64748B", lineHeight: ms(20) },
  bottomCTA: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: ms(10),
    backgroundColor: "#0F172A",
    paddingVertical: ms(16),
    borderRadius: ms(16),
    marginTop: ms(8),
  },
  bottomCTAText: { color: "white", fontSize: ms(15), fontWeight: "700" },
});
