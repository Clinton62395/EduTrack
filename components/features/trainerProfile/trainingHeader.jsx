import { Box, Button, Text } from "@/components/ui/theme";
import { Plus } from "lucide-react-native";
import { ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─────────────────────────────────────────
// TrainingsStatsBar
// ─────────────────────────────────────────
import { Calendar, Users } from "lucide-react-native";

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "draft", label: "Brouillons" },
  { key: "published", label: "Publiées" },
  { key: "archived", label: "Archivées" },
];

export function TrainingsHeader({ total, filter, onFilterChange, onAdd }) {
  return (
    <SafeAreaView>
      <Box padding="l" borderBottomWidth={1} borderBottomColor="border">
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="m"
        >
          <Box>
            <Text variant="title">Mes Formations</Text>
            <Text variant="caption" color="muted">
              {total} formation{total > 1 ? "s" : ""}
            </Text>
          </Box>
          <Button
            padding="xl"
            icon={
              <Plus
                color="white"
                size={24}
                strokeWidth={3}
                style={{ alignSelf: "center" }}
              />
            }
            size="small"
            onPress={onAdd}
            iconOnly
            iconPosition="right"
            style={{ justifyContent: "center", alignItems: "center" }}
          />
        </Box>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => onFilterChange(key)}
              style={{ marginRight: 8 }}
            >
              <Box
                paddingHorizontal="m"
                paddingVertical="s"
                borderRadius="m"
                backgroundColor={filter === key ? "primary" : "cardBackground"}
              >
                <Text
                  variant="caption"
                  fontWeight="600"
                  color={filter === key ? "white" : "text"}
                >
                  {label}
                </Text>
              </Box>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
const StatMini = ({ icon, label, value }) => (
  <Box alignItems="center">
    <Box flexDirection="row" alignItems="center" gap="xs">
      {icon}
      <Text fontWeight="700">{value}</Text>
    </Box>
    <Text variant="caption" color="muted">
      {label}
    </Text>
  </Box>
);

export function TrainingsStatsBar({ formations, user }) {
  // "Actives" = publiées dont le sessionStatus est "ongoing"
  const activeCount = formations.filter(
    (f) => f.status === "published" && f.sessionStatus === "ongoing",
  ).length;

  return (
    <Box
      position="absolute"
      bottom={20}
      left={20}
      right={20}
      backgroundColor="white"
      padding="m"
      borderRadius="l"
      flexDirection="row"
      justifyContent="space-around"
      style={{ elevation: 5 }}
    >
      <StatMini
        icon={<Users size={16} color="#2563EB" />}
        label="Élèves"
        value={user?.learnersCount || 0}
      />
      <StatMini
        icon={<Calendar size={16} color="#16A34A" />}
        label="Actives"
        value={activeCount}
      />
    </Box>
  );
}
