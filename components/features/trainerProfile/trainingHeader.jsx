import { Box, Button, Text } from "@/components/ui/theme";
import { Plus } from "lucide-react-native";
import { ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function TrainingsHeader({ total, filter, onFilterChange, onAdd }) {
  const filters = ["all", "planned", "ongoing", "completed"];

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
            padding="s"
            title="Ajouter"
            icon={<Plus color="white" size={18} />}
            size="small"
            onPress={onAdd}
          />
        </Box>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => onFilterChange(type)}
              style={{ marginRight: 8 }}
            >
              <Box
                paddingHorizontal="m"
                paddingVertical="s"
                borderRadius="m"
                backgroundColor={filter === type ? "primary" : "cardBackground"}
              >
                <Text
                  variant="caption"
                  fontWeight="600"
                  color={filter === type ? "white" : "text"}
                >
                  {type === "all"
                    ? "Toutes"
                    : type === "planned"
                      ? "À venir"
                      : type === "ongoing"
                        ? "En cours"
                        : "Terminées"}
                </Text>
              </Box>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
