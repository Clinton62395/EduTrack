/**
 * TrainerDashboard.jsx — Redesigned
 * Aesthetic: Refined dark-primary shell + clean white card system
 * Theme aligned to: primary #2563EB, background #F3F4F6
 */

import { router } from "expo-router";
import {
  Archive,
  BookOpen,
  ChevronRight,
  FileText,
  MoreVertical,
  Plus,
  RefreshCw,
  Trash2,
  Wifi,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/components/constants/authContext";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { PublishErrorModal } from "@/components/modal/publishedTrainingError";
import { MyLoader } from "@/components/ui/loader";
import { Snack } from "@/components/ui/snackbar";
import { Box, Text, ms } from "@/components/ui/theme";
import { useTrainings } from "@/hooks/useTraining";
import CreateTrainingModal from "../(modal)/createTrainingModal";

// ─────────────────────────────────────────
// FILTER TABS
// ─────────────────────────────────────────
const FILTERS = [
  { key: "all", label: "Tout", icon: BookOpen },
  { key: "draft", label: "Brouillons", icon: FileText },
  { key: "published", label: "Publiés", icon: Wifi },
  { key: "archived", label: "Archivés", icon: Archive },
];

function FilterTabs({ filter, stats, onFilterChange }) {
  return (
    <View style={styles.tabsWrapper}>
      {FILTERS.map(({ key, label, icon: Icon }) => {
        const active = filter === key;
        const count = stats[key] ?? 0;
        return (
          <Pressable
            key={key}
            onPress={() => onFilterChange(key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Icon
              size={ms(14)}
              color={active ? "#2563EB" : "#6B7280"}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {label}
            </Text>
            {count > 0 && (
              <View style={[styles.badge, active && styles.badgeActive]}>
                <Text
                  style={[styles.badgeText, active && styles.badgeTextActive]}
                >
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────
// STAT PILLS (header)
// ─────────────────────────────────────────
function StatPill({ label, value, color = "#2563EB" }) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────
function DashboardHeader({ user, total, stats, onAdd }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + ms(16) }]}>
      {/* Top row */}
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerGreeting}>Bonjour 👋</Text>
          <Text style={styles.headerName}>{user?.name || "Formateur"}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAdd}
          activeOpacity={0.85}
        >
          <Plus size={ms(20)} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatPill label="Formations" value={stats.all} color="#FFFFFF" />
        <View style={styles.statDivider} />
        <StatPill label="Publiées" value={stats.published} color="#86EFAC" />
        <View style={styles.statDivider} />
        <StatPill label="Brouillons" value={stats.draft} color="#FCD34D" />
        <View style={styles.statDivider} />
        <StatPill label="Archivées" value={stats.archived} color="#94A3B8" />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────
const STATUS_CONFIG = {
  draft: { label: "Brouillon", bg: "#FEF9C3", color: "#92400E" },
  published: { label: "Publié", bg: "#DCFCE7", color: "#166534" },
  archived: { label: "Archivé", bg: "#F1F5F9", color: "#475569" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.statusBadgeText, { color: cfg.color }]}>
        {cfg.label}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────
// ACTION MENU (bottom sheet style)
// ─────────────────────────────────────────
function ActionMenu({
  formation,
  onPublish,
  onUnpublish,
  onArchive,
  onUnarchive,
  onDelete,
  onClose,
}) {
  const isArchived = formation.status === "archived";
  const isPublished = formation.status === "published";

  const actions = isArchived
    ? [
        {
          label: "Désarchiver",
          icon: RefreshCw,
          color: "#2563EB",
          onPress: () => {
            onUnarchive(formation.id);
            onClose();
          },
        },
        {
          label: "Supprimer",
          icon: Trash2,
          color: "#DC2626",
          onPress: () => {
            onDelete(formation);
            onClose();
          },
        },
      ]
    : [
        isPublished
          ? {
              label: "Dépublier",
              icon: FileText,
              color: "#F59E0B",
              onPress: () => {
                onUnpublish(formation.id);
                onClose();
              },
            }
          : {
              label: "Publier",
              icon: Wifi,
              color: "#16A34A",
              onPress: () => {
                onPublish(formation.id);
                onClose();
              },
            },
        {
          label: "Archiver",
          icon: Archive,
          color: "#6B7280",
          onPress: () => {
            onArchive(formation.id);
            onClose();
          },
        },
        {
          label: "Supprimer",
          icon: Trash2,
          color: "#DC2626",
          onPress: () => {
            onDelete(formation);
            onClose();
          },
        },
      ];

  return (
    <Pressable style={styles.menuOverlay} onPress={onClose}>
      <View style={styles.menuCard}>
        <View style={styles.menuHandle} />
        <Text style={styles.menuTitle} numberOfLines={1}>
          {formation.title}
        </Text>
        {actions.map(({ label, icon: Icon, color, onPress }) => (
          <TouchableOpacity
            key={label}
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View
              style={[styles.menuIconWrap, { backgroundColor: color + "18" }]}
            >
              <Icon size={ms(16)} color={color} strokeWidth={2} />
            </View>
            <Text style={[styles.menuItemLabel, { color }]}>{label}</Text>
            <ChevronRight
              size={ms(14)}
              color={color}
              strokeWidth={2}
              style={{ opacity: 0.5 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </Pressable>
  );
}

// ─────────────────────────────────────────
// TRAINING CARD — redesigned
// ─────────────────────────────────────────
function TrainingCard({ item, onPress, onMenuPress }) {
  const moduleCount = item.totalModules ?? 0;
  const participantCount = item.participants?.length ?? 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Left accent */}
      <View
        style={[
          styles.cardAccent,
          {
            backgroundColor:
              item.status === "published"
                ? "#2563EB"
                : item.status === "archived"
                  ? "#94A3B8"
                  : "#F59E0B",
          },
        ]}
      />

      <View style={styles.cardContent}>
        {/* Title row */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={onMenuPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MoreVertical size={ms(18)} color="#6B7280" strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        {/* Meta row */}
        <View style={styles.cardMeta}>
          <StatusBadge status={item.status} />
          <Text style={styles.cardMetaSep}>·</Text>
          <Text style={styles.cardMetaText}>
            {moduleCount} module{moduleCount !== 1 ? "s" : ""}
          </Text>
          <Text style={styles.cardMetaSep}>·</Text>
          <Text style={styles.cardMetaText}>
            {participantCount} élève{participantCount !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Progress bar (published only) */}
        {item.status === "published" && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, participantCount * 5)}%` },
              ]}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────
function EmptyState({ filter, onCreatePress }) {
  const isArchived = filter === "archived";
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconCircle}>
        {isArchived ? (
          <Archive size={ms(32)} color="#94A3B8" strokeWidth={1.5} />
        ) : (
          <BookOpen size={ms(32)} color="#2563EB" strokeWidth={1.5} />
        )}
      </View>
      <Text style={styles.emptyTitle}>
        {isArchived ? "Aucune formation archivée" : "Aucune formation"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isArchived
          ? "Les formations archivées apparaîtront ici."
          : "Créez votre première formation pour commencer."}
      </Text>
      {!isArchived && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={onCreatePress}
          activeOpacity={0.85}
        >
          <Plus size={ms(16)} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.emptyButtonText}>Nouvelle formation</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────
export default function TrainerDashboard() {
  const { user } = useAuth();
  const {
    loading,
    trainings,
    filteredTrainings,
    stats,
    filter,
    setFilter,
    createTraining,
    publishTraining,
    unpublishTraining,
    deleteTraining,
    snackVisible,
    snackMessage,
    snackType,
    archiveTraining,
    unarchiveTraining,
    dismissSnack,
    refreshTrainings,
  } = useTrainings();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [menuFormation, setMenuFormation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishError, setPublishError] = useState({
    visible: false,
    reason: "",
  });

  const handleDeletePress = (formation) => {
    setSelectedFormation(formation);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFormation) return;
    setIsDeleting(true);
    try {
      await deleteTraining(selectedFormation.id);
      setShowDeleteModal(false);
      setSelectedFormation(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async (id) => {
    const result = await publishTraining(id);
    if (result && !result.success && result.reason) {
      setPublishError({ visible: true, reason: result.reason });
    }
  };

  const renderItem = useCallback(
    ({ item }) => (
      <TrainingCard
        item={item}
        onPress={() => router.push(`/(trainer-stack)/trainings/${item.id}`)}
        onMenuPress={() => setMenuFormation(item)}
      />
    ),
    [],
  );

  if (loading && trainings.length === 0) {
    return <MyLoader message="Chargement de vos formations..." />;
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* ── HEADER ── */}
      <DashboardHeader
        user={user}
        total={trainings.length}
        stats={stats}
        onAdd={() => setShowCreateModal(true)}
      />

      {/* ── FILTER TABS ── */}
      <FilterTabs filter={filter} stats={stats} onFilterChange={setFilter} />

      {/* ── LIST ── */}
      <FlatList
        data={filteredTrainings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={refreshTrainings}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={8}
        ListEmptyComponent={
          !loading && (
            <EmptyState
              filter={filter}
              onCreatePress={() => setShowCreateModal(true)}
            />
          )
        }
      />

      {/* ── ACTION MENU ── */}
      {menuFormation && (
        <ActionMenu
          formation={menuFormation}
          onPublish={handlePublish}
          onUnpublish={unpublishTraining}
          onArchive={archiveTraining}
          onUnarchive={unarchiveTraining}
          onDelete={handleDeletePress}
          onClose={() => setMenuFormation(null)}
        />
      )}

      {/* ── MODALS ── */}
      <PublishErrorModal
        visible={publishError.visible}
        onClose={() => setPublishError({ visible: false, reason: "" })}
        reason={publishError.reason}
      />
      <CreateTrainingModal
        visible={showCreateModal}
        onCreate={createTraining}
        onClose={() => setShowCreateModal(false)}
      />
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedFormation(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer la formation ?"
        message={
          selectedFormation
            ? `Voulez-vous vraiment supprimer "${selectedFormation.title}" ? Cette action est définitive.`
            : ""
        }
        loading={isDeleting}
        requiredMasterCode={user?.masterCode}
      />
      <Snack
        visible={snackVisible}
        onDismiss={dismissSnack}
        message={snackMessage}
        type={snackType}
      />
    </Box>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  // ── HEADER ──
  header: {
    backgroundColor: "#2563EB",
    paddingHorizontal: ms(20),
    paddingBottom: ms(24),
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ms(20),
  },
  headerGreeting: {
    fontSize: ms(13),
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  headerName: {
    fontSize: ms(22),
    color: "#FFFFFF",
    fontWeight: "700",
    marginTop: ms(2),
  },
  addButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: ms(16),
    paddingVertical: ms(12),
    paddingHorizontal: ms(8),
  },
  statPill: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: ms(20),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: ms(10),
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
    marginTop: ms(2),
    letterSpacing: 0.2,
  },
  statDivider: {
    width: 1,
    height: ms(32),
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // ── TABS ──
  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: ms(12),
    paddingVertical: ms(10),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: ms(4),
  },
  tab: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: ms(8),
    paddingHorizontal: ms(4),
    borderRadius: ms(10),
    gap: ms(4),
  },
  tabActive: {
    backgroundColor: "#EFF6FF",
  },
  tabLabel: {
    fontSize: ms(10),
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
  tabLabelActive: {
    color: "#2563EB",
    fontWeight: "700",
  },
  badge: {
    minWidth: ms(16),
    height: ms(16),
    borderRadius: ms(8),
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: ms(4),
  },
  badgeActive: {
    backgroundColor: "#2563EB",
  },
  badgeText: {
    fontSize: ms(9),
    color: "#6B7280",
    fontWeight: "700",
  },
  badgeTextActive: {
    color: "#FFFFFF",
  },

  // ── LIST ──
  listContent: {
    padding: ms(16),
    paddingBottom: ms(100),
    gap: ms(10),
  },

  // ── CARD ──
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: ms(14),
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: ms(8),
    shadowOffset: { width: 0, height: ms(2) },
    elevation: 2,
  },
  cardAccent: {
    width: ms(4),
    backgroundColor: "#2563EB",
  },
  cardContent: {
    flex: 1,
    padding: ms(14),
    gap: ms(8),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: ms(8),
  },
  cardTitle: {
    flex: 1,
    fontSize: ms(15),
    fontWeight: "600",
    color: "#0F172A",
    lineHeight: ms(22),
  },
  moreBtn: {
    padding: ms(2),
    marginTop: ms(1),
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
    flexWrap: "wrap",
  },
  cardMetaSep: {
    color: "#D1D5DB",
    fontSize: ms(12),
  },
  cardMetaText: {
    fontSize: ms(12),
    color: "#6B7280",
  },
  progressTrack: {
    height: ms(3),
    backgroundColor: "#E5E7EB",
    borderRadius: ms(2),
    overflow: "hidden",
    marginTop: ms(2),
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: ms(2),
    minWidth: ms(8),
  },

  // ── STATUS BADGE ──
  statusBadge: {
    paddingHorizontal: ms(8),
    paddingVertical: ms(2),
    borderRadius: ms(20),
  },
  statusBadgeText: {
    fontSize: ms(11),
    fontWeight: "600",
  },

  // ── ACTION MENU ──
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
    paddingBottom: ms(32),
    paddingHorizontal: ms(20),
    paddingTop: ms(12),
    gap: ms(4),
  },
  menuHandle: {
    width: ms(40),
    height: ms(4),
    backgroundColor: "#E5E7EB",
    borderRadius: ms(2),
    alignSelf: "center",
    marginBottom: ms(16),
  },
  menuTitle: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: ms(12),
    paddingHorizontal: ms(4),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: ms(14),
    paddingHorizontal: ms(12),
    borderRadius: ms(12),
    gap: ms(12),
  },
  menuIconWrap: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(10),
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemLabel: {
    flex: 1,
    fontSize: ms(15),
    fontWeight: "600",
  },

  // ── EMPTY STATE ──
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: ms(60),
    paddingHorizontal: ms(32),
    gap: ms(12),
  },
  emptyIconCircle: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(40),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: ms(8),
  },
  emptyTitle: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: ms(14),
    color: "#6B7280",
    textAlign: "center",
    lineHeight: ms(20),
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingVertical: ms(12),
    paddingHorizontal: ms(24),
    borderRadius: ms(12),
    gap: ms(8),
    marginTop: ms(8),
  },
  emptyButtonText: {
    fontSize: ms(15),
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
