import { Box, Text } from "@/components/ui/theme";
import { Controller } from "react-hook-form";
import { StyleSheet, TextInput } from "react-native";

export function InputField({
  control,
  name,
  label,
  placeholder,
  error,
  rules = {},
  icon,
  secureTextEntry,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
  onFocus,
}) {
  return (
    <Box marginBottom="m" width="100%">
      {label && (
        <Text variant="body" marginBottom="xs" fontWeight="600" color="text">
          {label}
        </Text>
      )}

      <Controller
        control={control}
        name={name}
        rules={rules}
        defaultValue=""
        render={({ field: { onChange, onBlur, value } }) => (
          <Box
            flexDirection="row"
            alignItems="center"
            backgroundColor="white"
            borderWidth={1}
            borderColor={error ? "danger" : "border"} // "danger" ou "red" selon ton thème
            borderRadius="m"
            paddingHorizontal="m"
            style={[
              multiline && {
                minHeight: 90,
                alignItems: "flex-start",
                paddingTop: 10,
              },
            ]}
          >
            {icon && <Box marginRight="s">{icon}</Box>}

            <TextInput
              style={[
                styles.input,
                multiline && { textAlignVertical: "top", minHeight: 90 },
              ]}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onFocus={onFocus}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              multiline={multiline}
              numberOfLines={numberOfLines}
            />
          </Box>
        )}
      />

      {error && (
        <Text variant="error" marginTop="xs">
          {error.message || "Ce champ est requis"}
        </Text>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#1F2937",
  },
});
