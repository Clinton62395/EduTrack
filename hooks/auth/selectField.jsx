import { Box, Text } from "@/components/ui/theme";
import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { FlatList, Modal, TouchableOpacity } from "react-native";

export function SelectField({ control, name, label, options = [], error }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box marginBottom="m">
      {/* Label */}
      {label && (
        <Text variant="caption" marginBottom="xs">
          {label}
        </Text>
      )}

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <>
            {/* Champ principal */}
            <TouchableOpacity
              onPress={() => setIsOpen(true)}
              style={{
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: error ? "#DC2626" : "#E5E7EB",
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: value ? "text" : "textSecondary",
                  fontSize: 16,
                }}
              >
                {value
                  ? options.find((opt) => opt.value === value)?.label
                  : "Sélectionnez..."}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>

            {/* Modal options */}
            <Modal visible={isOpen} transparent animationType="fade">
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  justifyContent: "center",
                }}
                onPress={() => setIsOpen(false)}
              >
                <Box
                  backgroundColor="white"
                  marginHorizontal="l"
                  borderRadius="xl"
                  style={{ maxHeight: 300, overflow: "hidden" }}
                >
                  <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          onChange(item.value);
                          setIsOpen(false);
                        }}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: "#F3F4F6",
                        }}
                      >
                        <Text style={{ fontSize: 16, color: "text" }}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </Box>
              </TouchableOpacity>
            </Modal>
          </>
        )}
      />

      {/* Erreur */}
      {error && (
        <Text variant="error" marginTop="xs">
          {error.message}
        </Text>
      )}
    </Box>
  );
}
