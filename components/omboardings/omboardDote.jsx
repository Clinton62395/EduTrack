// components/PaginationDots.jsx
import { Box } from "@/components/ui/theme";
import { StyleSheet } from "react-native";

export function PaginationDots({ data, currentIndex }) {
  return (
    <Box flexDirection="row" gap="xs" alignItems="center">
      {data.map((_, index) => {
        const isActive = currentIndex === index;
        return (
          <Box
            key={index}
            style={[
              styles.dot,
              isActive ? styles.dotActive : styles.dotInactive,
            ]}
          />
        );
      })}
    </Box>
  );
}

const styles = StyleSheet.create({
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: "rgba(99, 179, 237, 0.95)",
    shadowColor: "#63B3ED",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
    // Bordure glass subtile
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
});
