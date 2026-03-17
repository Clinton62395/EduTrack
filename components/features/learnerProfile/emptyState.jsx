import {
  Award,
  BookOpen,
  ChevronRight,
  Quote,
  Star,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import JoinTrainingModal from "../../../app/(modal)/learnerModal/joinTrainingModal";

export function EmptyState({ user, insets }) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { width } = useWindowDimensions();
  // ─────────────────────────────────────────
  // DONNÉES STATIQUES
  // ─────────────────────────────────────────
  const STATS = [
    { value: "120+", label: "Formations", icon: BookOpen, color: "#2563EB" },
    { value: "840+", label: "Apprenants", icon: Users, color: "#10B981" },
    { value: "96%", label: "Satisfaction", icon: Star, color: "#F59E0B" },
    { value: "320+", label: "Certifiés", icon: Award, color: "#7C3AED" },
  ];

  const TESTIMONIALS = [
    {
      id: "1",
      name: "Fatoumata D.",
      role: "Étudiante en marketing",
      text: "EduTrack a complètement changé ma façon d'apprendre. Mon formateur suit ma progression en temps réel et les certificats sont reconnus.",
      rating: 5,
      initial: "F",
      color: "#2563EB",
    },
    {
      id: "2",
      name: "Mamadou B.",
      role: "Développeur freelance",
      text: "J'ai suivi 3 formations en 2 mois. La plateforme est simple, les quiz m'ont vraiment aidé à ancrer les connaissances.",
      rating: 5,
      initial: "M",
      color: "#10B981",
    },
    {
      id: "3",
      name: "Aïssatou K.",
      role: "Comptable",
      text: "Le code de présence est génial — plus de feuilles de présence. Mon certificat PDF est arrivé directement sur mon téléphone.",
      rating: 5,
      initial: "A",
      color: "#7C3AED",
    },
  ];

  return (
    <ScrollView
      style={styles.emptyRoot}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── FOND SOMBRE ── */}
      <View style={styles.heroBg}>
        {/* Grille décorative */}
        <View style={styles.grid} />
        {/* Lueur bleue */}
        <View style={styles.glow} />
        <View style={[styles.glow, styles.glowSecondary]} />

        {/* Contenu hero */}
        <View style={[styles.heroContent, { paddingTop: 24 }]}>
          {/* Salutation */}
          <View style={styles.greetingBadge}>
            <View style={styles.greetingDot} />
            <Text style={styles.greetingText}>
              Bienvenue, {user?.name?.split(" ")[0]} 👋
            </Text>
          </View>

          <Text style={styles.heroTitle}>Votre parcours{"\n"}commence ici</Text>
          <Text style={styles.heroSub}>
            Rejoignez une formation avec le code de votre formateur et commencez
            à apprendre dès aujourd&apos;hui.
          </Text>

          {/* CTA principal */}
          <JoinTrainingModal
            trigger={({ open }) => (
              <TouchableOpacity
                onPress={open}
                style={styles.heroCTA}
                activeOpacity={0.85}
              >
                <BookOpen size={20} color="white" />
                <Text style={styles.heroCTAText}>Rejoindre une formation</Text>
                <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            )}
          />

          <Text style={styles.heroHint}>
            Entrez le code partagé par votre formateur
          </Text>
        </View>
      </View>

      {/* ── STATS ── */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionLabel}>LA PLATEFORME EN CHIFFRES</Text>
        <View style={styles.statsGrid}>
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <View
                key={i}
                style={[styles.statBox, { width: (width - 60) / 2 }]}
              >
                <View
                  style={[
                    styles.statIconBox,
                    { backgroundColor: `${stat.color}18` },
                  ]}
                >
                  <Icon size={20} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── TÉMOIGNAGES ── */}
      <View style={styles.testimonialsSection}>
        <Text style={styles.sectionLabel}>ILS NOUS FONT CONFIANCE</Text>

        <FlatList
          data={TESTIMONIALS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / (width - 40),
            );
            setActiveTestimonial(index);
          }}
          renderItem={({ item }) => (
            <View style={[styles.testimonialCard, { width: width - 40 }]}>
              {/* Quote icon */}
              <View
                style={[
                  styles.quoteIcon,
                  { backgroundColor: `${item.color}15` },
                ]}
              >
                <Quote size={16} color={item.color} />
              </View>

              <Text style={styles.testimonialText}>"{item.text}"</Text>

              <View style={styles.testimonialFooter}>
                {/* Avatar */}
                <View
                  style={[
                    styles.testimonialAvatar,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Text style={styles.testimonialInitial}>{item.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.testimonialName}>{item.name}</Text>
                  <Text style={styles.testimonialRole}>{item.role}</Text>
                </View>
                {/* Étoiles */}
                <View style={styles.starsRow}>
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={12} color="#F59E0B" fill="#F59E0B" />
                  ))}
                </View>
              </View>
            </View>
          )}
        />

        {/* Indicateurs de pagination */}
        <View style={styles.dotsRow}>
          {TESTIMONIALS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeTestimonial && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      {/* ── COMMENT ÇA MARCHE ── */}
      <View style={styles.howSection}>
        <Text style={styles.sectionLabel}>COMMENT ÇA MARCHE</Text>
        {[
          {
            step: "1",
            title: "Recevez votre code",
            desc: "Votre formateur vous partage un code d'invitation unique.",
          },
          {
            step: "2",
            title: "Rejoignez la formation",
            desc: "Entrez le code dans l'app et accédez au contenu immédiatement.",
          },
          {
            step: "3",
            title: "Apprenez et progressez",
            desc: "Suivez les leçons, validez les quiz, obtenez votre certificat.",
          },
        ].map((item, i) => (
          <View key={i} style={styles.howRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>{item.step}</Text>
            </View>
            {i < 2 && <View style={styles.stepLine} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.howTitle}>{item.title}</Text>
              <Text style={styles.howDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ── EMPTY STATE ──
  emptyRoot: { flex: 1, backgroundColor: "#F8FAFC" },

  heroBg: {
    backgroundColor: "#0A0F2E",
    minHeight: 380,
    overflow: "hidden",
    position: "relative",
  },
  grid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.06,
    // Simulé via borderRadius + répétition — React Native ne supporte pas background-image
  },
  glow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#2563EB",
    opacity: 0.12,
    top: -80,
    left: -60,
    // blur simulé
  },
  glowSecondary: {
    backgroundColor: "#7C3AED",
    opacity: 0.08,
    top: 100,
    right: -80,
    left: undefined,
  },
  heroContent: {
    padding: 28,
    paddingBottom: 40,
  },
  greetingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(37,99,235,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.3)",
    marginBottom: 20,
  },
  greetingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  greetingText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "500",
  },

  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "white",
    lineHeight: 42,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 22,
    marginBottom: 28,
  },
  heroCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 16,
    shadowColor: "#2563EB",
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginBottom: 12,
  },
  heroCTAText: { color: "white", fontSize: 16, fontWeight: "700", flex: 1 },
  heroHint: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    textAlign: "center",
  },

  // ── STATS ──
  statsSection: { padding: 20, paddingBottom: 8 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },

  // ── TÉMOIGNAGES ──
  testimonialsSection: { paddingHorizontal: 20, paddingBottom: 8 },
  testimonialCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginRight: 0,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  quoteIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
    fontStyle: "italic",
    marginBottom: 16,
  },
  testimonialFooter: { flexDirection: "row", alignItems: "center", gap: 10 },
  testimonialAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  testimonialInitial: { color: "white", fontWeight: "800", fontSize: 15 },
  testimonialName: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  testimonialRole: { fontSize: 11, color: "#94A3B8" },
  starsRow: { flexDirection: "row", gap: 2 },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E2E8F0" },
  dotActive: { width: 18, backgroundColor: "#2563EB" },

  // ── COMMENT ÇA MARCHE ──
  howSection: { padding: 20 },
  howRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stepNumber: { color: "white", fontWeight: "800", fontSize: 15 },
  stepLine: {
    position: "absolute",
    left: 17,
    top: 36,
    width: 2,
    height: 24,
    backgroundColor: "#E2E8F0",
  },
  howTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 3,
  },
  howDesc: { fontSize: 13, color: "#64748B", lineHeight: 20 },
});
