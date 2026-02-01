import { Box, Text } from "@/components/ui/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { Animated, TextInput, TouchableOpacity } from "react-native";

export function InputField({
  control,
  name,
  label,
  placeholder,
  secureTextEntry = false,
  error,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const borderAnim = useRef(new Animated.Value(0)).current; // pour animation

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? "red" : "#d1d5db", "#2563EB"], // gris -> bleu
  });

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
          <Animated.View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderWidth: 1,
              borderColor,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <TextInput
              placeholder={placeholder}
              value={value || ""}
              onChangeText={onChange}
              secureTextEntry={!showPassword}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                flex: 1,
                fontSize: 16,
                color: "#111827",
                paddingVertical: 4,
              }}
              {...props}
            />

            {secureTextEntry && (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            )}
          </Animated.View>
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
