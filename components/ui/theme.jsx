import { createBox, createText, createTheme } from "@shopify/restyle";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// ─────────────────────────────────────────
// 📐 HELPERS DE RESPONSIVENESS
// ─────────────────────────────────────────
export const hs = (size) => scale(size); // horizontal
export const vs = (size) => verticalScale(size); // vertical
export const ms = (size, factor = 0.5) => moderateScale(size, factor); // modéré

const theme = createTheme({
  colors: {
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    secondary: "#16A34A",
    secondaryDark: "#F1F5F9",
    background: "#F3F4F6",
    cardBackground: "#FFFFFF",
    text: "#0F172A",
    textSecondary: "#6B7280",
    danger: "#DC2626",
    warning: "#F59E0B",
    success: "#16A34A",
    info: "#3B82F6",
    infoBackground: "rgba(37, 99, 235, 0.1)",
    border: "#E5E7EB",
    white: "#FFFFFF",
    black: "#000000",
    red: "#DC2626",
    outline: "transparent",
    muted: "#64748B",
    gray: "#9CA3AF",
    warningBackground: "rgba(245, 158, 11, 0.3)",
    secondaryBackground: "#F9FAFB",
    transparent: "transparent",
    successLight: "#F3FFF7",
    dangerLight: "#FFF1F2",
    warningDark: "#B45309",
    primaryLight: "#EFF6FF",
    overlayLight: "rgba(255, 255, 255, 0.7)",
    overlayDark: "rgba(0, 0, 0, 0.7)",
  },

  // ✅ Spacing responsive via ms()
  spacing: {
    xs: ms(4),
    s: ms(8),
    m: ms(16),
    l: ms(24),
    xl: ms(32),
    xxl: ms(40),
    xxxl: ms(48),
  },

  // ✅ Border radii responsive via ms()
  borderRadii: {
    xs: ms(4),
    s: ms(6),
    m: ms(12),
    l: ms(20),
    lg: ms(24),
    xl: ms(32),
    xxl: ms(40),
    rounded: ms(50),
  },

  // ✅ Text variants responsive via ms()
  textVariants: {
    defaults: {
      fontSize: ms(16),
      color: "text",
      fontWeight: "400",
      lineHeight: ms(24),
    },
    body: {
      fontSize: ms(16),
      color: "text",
      lineHeight: ms(24),
    },
    label: {
      fontSize: ms(12),
      fontWeight: "500",
      color: "textSecondary",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    small: {
      fontSize: ms(12),
      color: "textSecondary",
    },
    title: {
      fontSize: ms(24),
      fontWeight: "700",
      color: "primary",
      lineHeight: ms(32),
    },
    subtitle: {
      fontSize: ms(18),
      color: "text",
      fontWeight: "600",
    },
    hero: {
      fontSize: ms(34),
      fontWeight: "800",
      color: "primary",
    },
    button: {
      fontSize: ms(16),
      fontWeight: "600",
      color: "white",
    },
    caption: {
      fontSize: ms(14),
      color: "textSecondary",
      lineHeight: ms(20),
    },
    captionSmall: {
      fontSize: ms(12),
      color: "muted",
      lineHeight: ms(16),
    },
    action: {
      fontSize: ms(14),
      fontWeight: "600",
      color: "info",
    },
    error: {
      fontSize: ms(14),
      color: "danger",
    },
    success: {
      fontSize: ms(14),
      color: "success",
    },
    warning: {
      fontSize: ms(14),
      color: "warning",
    },
    info: {
      fontSize: ms(14),
      color: "info",
    },
  },
});

export const Box = createBox();
export const Text = createText();

// ─────────────────────────────────────────
// 🔘 BUTTON
// ─────────────────────────────────────────
export function Button({
  title,
  onPress,
  disabled = false,
  icon = null,
  iconPosition = "left",
  variant = "primary",
  iconOnly = false,
  loading = false,
  ...props
}) {
  const isOutline = variant === "outline";
  const isTransparent = variant === "transparent";
  const isLight = isOutline || isTransparent;

  const bgColors = {
    primary: "primary",
    secondary: "secondary",
    warning: "warning",
    info: "info",
    success: "success",
    danger: "danger",
    error: "danger",
    gray: "gray",
    outline: "transparent",
    transparent: "transparent",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <Box
        backgroundColor={disabled ? "gray" : bgColors[variant] || "primary"}
        paddingVertical={iconOnly ? "xs" : "m"}
        paddingHorizontal={iconOnly ? "xs" : "m"}
        borderRadius={iconOnly ? "rounded" : "m"}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap="s"
        borderWidth={isOutline ? 1.5 : 0}
        borderColor={
          isOutline ? (disabled ? "gray" : "primary") : "transparent"
        }
        style={{
          elevation: isLight ? 0 : ms(2),
          shadowOpacity: 0.1,
          shadowRadius: ms(3),
        }}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={isLight ? "#2563EB" : "white"}
          />
        ) : (
          <>
            {!iconOnly && (
              <Text
                variant="button"
                color={disabled ? "white" : isLight ? "primary" : "white"}
              >
                {title}
              </Text>
            )}

            {icon && iconPosition === "right" && (
              <Box
                style={{
                  marginLeft: iconOnly ? 0 : ms(8),
                  alignSelf: iconOnly ? "center" : "flex-end",
                }}
              >
                {icon}
              </Box>
            )}

            {icon && iconPosition === "left" && !iconOnly && (
              <Box style={{ marginRight: ms(8) }}>{icon}</Box>
            )}
          </>
        )}
      </Box>
    </TouchableOpacity>
  );
}

export default theme;
