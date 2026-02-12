import { Box, Text } from "@/components/ui/theme";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { useController } from "react-hook-form";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export function DateField({
  control,
  name,
  label,
  error,
  minimumDate,
  maximumDate,
  placeholder = "JJ/MM/AAAA",
}) {
  const [showPicker, setShowPicker] = useState(false);

  const {
    field: { value, onChange },
  } = useController({
    control,
    name,
  });

  // Convertir une valeur en Date (ou null si invalide)
  const convertToDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (val?.toDate) return val.toDate();

    const converted = new Date(val);
    return isNaN(converted.getTime()) ? null : converted;
  };

  // Date pour l'affichage
  const dateValue = convertToDate(value);
  const displayValue = dateValue ? dateValue.toLocaleDateString("fr-FR") : "";

  // Date pour le picker (toujours valide)
  const pickerDate = dateValue || new Date();

  return (
    <Box marginBottom="m" width="100%">
      {/* Label */}
      {label && (
        <Text variant="body" marginBottom="xs" fontWeight="600" color="text">
          {label}
        </Text>
      )}

      {/* Input affichage (clickable) */}
      <TouchableOpacity onPress={() => setShowPicker(true)} activeOpacity={0.7}>
        <Box
          backgroundColor="white"
          borderWidth={1}
          borderColor={error ? "danger" : "border"}
          borderRadius="m"
          paddingHorizontal="m"
          height={48}
          justifyContent="center"
        >
          <TextInput
            style={styles.input}
            value={displayValue}
            placeholder={placeholder}
            editable={false}
            pointerEvents="none"
            placeholderTextColor="#9CA3AF"
          />
        </Box>
      </TouchableOpacity>

      {/* Message d'erreur */}
      {error && (
        <Text variant="caption" color="danger" marginTop="xs">
          {error.message || "Ce champ est requis"}
        </Text>
      )}

      {/* DatePicker natif */}
      {showPicker && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
        />
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    color: "#1F2937",
  },
});
