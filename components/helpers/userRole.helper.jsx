import { Box, Text, ms } from "@/components/ui/theme";
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
    padding: ms(12),
    borderRadius: ms(12),
    borderWidth: ms(1),
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  radioOptionSelected: {
    borderColor: "#2563EB",
    backgroundColor: "rgba(37, 99, 235, 0.05)",
  },
  radioCircle: {
    height: ms(18),
    width: ms(18),
    borderRadius: ms(9),
    borderWidth: ms(2),
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: ms(5),
  },
  radioCircleSelected: {
    borderColor: "#2563EB",
    marginLeft: ms(5),
  },
  radioInnerCircle: {
    height: ms(10),
    width: ms(10),
    borderRadius: ms(5),
  },
});
