// components/InputField.jsx
import { Box, Text } from "@/components/ui/theme";
import { Controller } from "react-hook-form";

export function InputField({
  control,
  name,
  label,
  placeholder,
  secureTextEntry = false,
  error,
  ...props
}) {
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
            <input
              type={secureTextEntry ? "password" : "text"}
              placeholder={placeholder}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: 16,
                color: "#111827",
              }}
              {...props}
            />
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
