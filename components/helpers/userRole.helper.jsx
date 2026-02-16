import { Box, Text } from "@/components/ui/theme";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// --- Composant interne pour les Radio Buttons ---
export const RoleOption = ({ label, value, currentRole, onSelect, icon }) => {
  const isSelected = currentRole === value;
  return (
    <TouchableOpacity
      onPress={() => onSelect(value)}
      activeOpacity={0.8}
      style={[styles.radioOption, isSelected && styles.radioOptionSelected]}
    >
      <Box flexDirection="row" alignItems="center" gap="s">
        {icon}
        <Text
          variant="body"
          fontWeight={isSelected ? "700" : "400"}
          color={isSelected ? "primary" : "textSecondary"}
        >
          {label}
        </Text>
      </Box>
      <View
        style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}
      >
        {isSelected && <View style={styles.radioInnerCircle} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  radioOptionSelected: {
    borderColor: "#2563EB",
    backgroundColor: "rgba(37, 99, 235, 0.05)",
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },
  radioCircleSelected: {
    borderColor: "#2563EB", 
    marginLeft: 5,
  },
  radioInnerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },
});
