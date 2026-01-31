import { Box, Text } from "@/components/ui/theme";
import { Picker } from "@react-native-picker/picker";
import { Controller } from "react-hook-form";

export function SelectField({ control, name, label, options = [], error }) {
  return (
    <Box marginBottom="m">
      {label && (
        <Text variant="body" marginBottom="xs" color="text">
          {label}
        </Text>
      )}

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <Box
            backgroundColor="white"
            borderWidth={1}
            borderColor={error ? "red" : "border"}
            borderRadius="m"
            padding="m"
          >
            <Picker selectedValue={value || ""} onValueChange={onChange}>
              <Picker.Item label="Sélectionnez..." value="" />
              {options.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </Box>
        )}
      />

      {error && (
        <Text variant="caption" color="red" marginTop="xs">
          {error.message}
        </Text>
      )}
    </Box>
  );
}
