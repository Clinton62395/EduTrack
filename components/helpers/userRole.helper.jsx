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
      <Box
        flexDirection="row"
        justifyContent="space-around"
        alignItems="center"
        flex={1}
        width="100%"
      >
        {icon}
        <Text
          variant="body"
          fontWeight={isSelected ? "700" : "400"}
          color={isSelected ? "primary" : "textSecondary"}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
        <View
          style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}
        >
          {isSelected && <View style={styles.radioInnerCircle} />}
        </View>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  radioOption: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    padding: ms(12),
    borderRadius: ms(12),
    borderWidth: ms(1),
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    minWidth: 130, // Assure une largeur minimale
    flex: 1, // Permet de prendre l'espace disponible
  },
  radioOptionSelected: {
    borderColor: "#2563EB",
    backgroundColor: "rgba(37, 99, 235, 0.05)",
  },
  radioCircle: {
    height: ms(15),
    width: ms(15),
    borderRadius: ms(9),
    borderWidth: ms(2),
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: ms(8), // Espace entre le texte et le cercle
    flexShrink: 0, // Empêche le cercle de rétrécir
  },
  radioCircleSelected: {
    borderColor: "#2563EB",
  },
  radioInnerCircle: {
    height: ms(10),
    width: ms(10),
    borderRadius: ms(5),
  },
});
