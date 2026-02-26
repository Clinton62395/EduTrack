import { Box, Text } from "@/components/ui/theme";
import { Modal, ScrollView, StyleSheet, TouchableOpacity } from "react-native";


export function DropdownModal({
  visible,
  trainings,
  selected,
  onSelect,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Box
          backgroundColor="white"
          borderRadius="xl"
          marginHorizontal="l"
          overflow="hidden"
          style={styles.dropdownCard}
        >
          <Box padding="m" borderBottomWidth={1} borderBottomColor="border">
            <Text variant="body" fontWeight="bold">
              Choisir une formation
            </Text>
          </Box>
          <ScrollView style={{ maxHeight: 300 }}>
            {trainings?.map((training) => {
              const isSelected = selected?.id === training.id;
              return (
                <TouchableOpacity
                  key={training.id}
                  onPress={() => onSelect(training)}
                  activeOpacity={0.7}
                >
                  <Box
                    padding="m"
                    borderBottomWidth={1}
                    borderBottomColor="border"
                    backgroundColor={isSelected ? "successLight" : "white"}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text
                      variant="body"
                      flex={1}
                      numberOfLines={1}
                      color={isSelected ? "primary" : "text"}
                    >
                      {training.title}
                    </Text>
                    {isSelected && (
                      <Box
                        width={8}
                        height={8}
                        borderRadius="rounded"
                        backgroundColor="primary"
                      />
                    )}
                  </Box>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Box>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
  },
  dropdownCard: {
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
});
