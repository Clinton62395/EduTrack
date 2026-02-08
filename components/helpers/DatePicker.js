import { InputField } from "@/hooks/auth/inputField";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { useController } from "react-hook-form";
import { Platform, TouchableOpacity } from "react-native";

export function DateField({
  control,
  name,
  label,
  error,
  minimumDate,
  maximumDate,
}) {
  const [showPicker, setShowPicker] = useState(false);

  const {
    field: { value, onChange },
  } = useController({
    control,
    name,
  });

  const displayValue =
    value instanceof Date && !isNaN(value) ? value.toLocaleDateString() : "";

  return (
    <>
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <InputField
          label={label}
          value={displayValue}
          editable={false}
          pointerEvents="none"
          error={error}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value instanceof Date ? value : new Date()}
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
    </>
  );
}
