import { useAuth } from "@/components/constants/authContext";
import { useNotifications } from "@/hooks/useNotification";
import { router } from "expo-router";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  Lock,
  Smartphone,
  Zap,
} from "lucide-react-native";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ms } from "../../ui/theme";

// ─────────────────────────────────────────
// 🧩 MAIN SCREEN
// ─────────────────────────────────────────
export function UniversalNotificationsScreen() {
  const { user } = useAuth();
  const { prefs, togglePref } = useNotifications();
  const isTrainer = user?.role === "trainer";

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <NotifHeader />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* HERO */}
          <NotifHero />

          {/* SECTION — CRITIQUES */}
          <SectionLabel label="Notifications essentielles" />
          <View style={styles.card}>
            <NotifItem
              icon={Zap}
              iconColor="#F59E0B"
              iconBg="#FFFBEB"
              title="Code de présence"
              subtitle="Reçois le code d'accès au cours en temps réel"
              locked
            />
            {!isTrainer && (
              <NotifItem
                icon={Bell}
                iconColor="#10B981"
                iconBg="#F0FDF4"
                title="Confirmation d'inscription"
                subtitle="Quand tu rejoins une nouvelle formation"
                locked
                last
              />
            )}
            {isTrainer && (
              <NotifItem
                icon={Bell}
                iconColor="#10B981"
                iconBg="#F0FDF4"
                title="Nouveau learner inscrit"
                subtitle="Quand un apprenant rejoint ta formation"
                locked
                last
              />
            )}
          </View>

          <LockedNote />

          {/* SECTION — OPTIONNELLES */}
          <SectionLabel
            label="Notifications optionnelles"
            style={{ marginTop: 24 }}
          />
          <View style={styles.card}>
            <NotifItem
              icon={Smartphone}
              iconColor="#2563EB"
              iconBg="#EFF6FF"
              title="Notifications Push"
              subtitle="Alertes directes sur ton téléphone"
              value={prefs.push}
              onToggle={() => togglePref("push")}
            />
            <NotifItem
              icon={BookOpen}
              iconColor="#7C3AED"
              iconBg="#F5F3FF"
              title={isTrainer ? "Activité des apprenants" : "Nouveaux modules"}
              subtitle={
                isTrainer
                  ? "Quand un apprenant termine une leçon"
                  : "Dès qu'un nouveau module est ajouté à ta formation"
              }
              value={prefs.formations}
              onToggle={() => togglePref("formations")}
              last
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 HEADER
// ─────────────────────────────────────────
function NotifHeader() {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <ChevronLeft size={22} color="#111827" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Notifications</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 HERO
// ─────────────────────────────────────────
function NotifHero() {
  return (
    <View style={styles.hero}>
      <View style={styles.heroIconOuter}>
        <View style={styles.heroIconInner}>
          <Bell size={28} color="#2563EB" />
        </View>
        {/* Pulse ring */}
        <View style={styles.heroRing} />
      </View>
      <Text style={styles.heroTitle}>Gérer mes alertes</Text>
      <Text style={styles.heroSub}>
        Certaines notifications sont essentielles au bon fonctionnement de
        l&apos;app et ne peuvent pas être désactivées.
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 SECTION LABEL
// ─────────────────────────────────────────
function SectionLabel({ label, style }) {
  return (
    <Text style={[styles.sectionLabel, style]}>{label.toUpperCase()}</Text>
  );
}

// ─────────────────────────────────────────
// 🧩 LOCKED NOTE
// ─────────────────────────────────────────
function LockedNote() {
  return (
    <View style={styles.lockedNote}>
      <Lock size={12} color="#92400E" />
      <Text style={styles.lockedNoteText}>
        Ces notifications sont requises pour le bon fonctionnement de l&apos;app
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────
// 🧩 NOTIFICATION ITEM
// ─────────────────────────────────────────
function NotifItem({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  value,
  onToggle,
  locked = false,
  last = false,
}) {
  return (
    <View style={[styles.item, !last && styles.itemBorder]}>
      {/* Icône */}
      <View style={[styles.itemIconBox, { backgroundColor: iconBg }]}>
        <Icon size={18} color={iconColor} />
      </View>

      {/* Texte */}
      <View style={styles.itemText}>
        <View style={styles.itemTitleRow}>
          <Text style={styles.itemTitle}>{title}</Text>
          {locked && (
            <View style={styles.lockedBadge}>
              <Lock size={9} color="#92400E" />
              <Text style={styles.lockedBadgeText}>Requis</Text>
            </View>
          )}
        </View>
        <Text style={styles.itemSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      {/* Toggle ou Lock */}
      {locked ? (
        <View style={styles.lockedSwitch}>
          <Lock size={14} color="#D1D5DB" />
        </View>
      ) : (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
          thumbColor={value ? "#2563EB" : "#F9FAFB"}
          ios_backgroundColor="#E5E7EB"
        />
      )}
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
    padding: ms(20),
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: ms(16),
    paddingVertical: ms(12),
    backgroundColor: "white",
    borderBottomWidth: ms(1),
    borderBottomColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: ms(8),
        shadowOffset: { width: 0, height: ms(2) },
      },
      android: { elevation: 2 },
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
    paddingVertical: ms(28),
    marginBottom: ms(8),
  },
  heroIconOuter: {
    width: ms(80),
    height: ms(80),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: ms(16),
    position: "relative",
  },
  heroIconInner: {
    width: ms(64),
    height: ms(64),
    borderRadius: ms(20),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: ms(1),
    borderColor: "#BFDBFE",
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOpacity: 0.2,
        shadowRadius: ms(12),
        shadowOffset: { width: 0, height: ms(4) },
      },
      android: { elevation: 4 },
    }),
  },
  heroRing: {
    position: "absolute",
    width: ms(80),
    height: ms(80),
    borderRadius: ms(24),
    borderWidth: ms(1),
    borderColor: "rgba(37,99,235,0.15)",
  },
  heroTitle: {
    fontSize: ms(20),
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
    marginBottom: ms(8),
  },
  heroSub: {
    fontSize: ms(13),
    color: "#64748B",
    textAlign: "center",
    lineHeight: ms(20),
    paddingHorizontal: ms(20),
  },

  // SECTION
  sectionLabel: {
    fontSize: ms(10),
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: ms(1.2),
    marginBottom: ms(10),
    marginLeft: ms(4),
  },

  // CARD
  card: {
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
      android: { elevation: 2 },
    }),
  },

  // ITEM
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(14),
    paddingHorizontal: ms(16),
    paddingVertical: ms(14),
  },
  itemBorder: {
    borderBottomWidth: ms(1),
    borderBottomColor: "#F1F5F9",
  },
  itemIconBox: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(12),
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    gap: ms(3),
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(8),
    flexWrap: "wrap",
  },
  itemTitle: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#0F172A",
  },
  itemSubtitle: {
    fontSize: ms(12),
    color: "#64748B",
    lineHeight: ms(17),
  },

  // LOCKED
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(3),
    backgroundColor: "#FEF3C7",
    paddingHorizontal: ms(6),
    paddingVertical: ms(2),
    borderRadius: ms(10),
  },
  lockedBadgeText: {
    fontSize: ms(9),
    fontWeight: "700",
    color: "#92400E",
  },
  lockedSwitch: {
    width: ms(44),
    justifyContent: "center",
    alignItems: "center",
  },
  lockedNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
    marginTop: ms(8),
    marginLeft: ms(4),
  },
  lockedNoteText: {
    fontSize: ms(11),
    color: "#92400E",
    flex: 1,
    lineHeight: ms(16),
  },
});
