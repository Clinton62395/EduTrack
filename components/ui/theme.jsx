// theme.js
import { createBox, createText, createTheme } from "@shopify/restyle";
import { TouchableOpacity } from "react-native";

const theme = createTheme({
  colors: {
    primary: "#2563EB",
    primaryDark: "#1D4ED8", // Pour les états pressés
    secondary: "#16A34A",
    secondaryDark: "#15803D", // Pour les états pressés
    background: "#F9FAFB",
    cardBackground: "#FFFFFF",
    text: "#111827",
    textSecondary: "#6B7280", // Alternative à "muted"
    danger: "#DC2626", // Pour les erreurs/alertes
    warning: "#F59E0B", // Pour les avertissements
    success: "#16A34A", // Égal à secondary
    info: "#3B82F6", // Pour les informations
    infoBackground: "rgba(37, 99, 235, 0.1)", // Pour les informations
    border: "#E5E7EB", // Pour les séparateurs
    white: "#FFFFFF",
    black: "#000000",
    red: "#DC2626",

    muted: "#6B7280",
    gray: "#9CA3AF",
    warningBackground: "rgba(245, 158, 11, 0.3)",
    secondaryBackground: "#F9FAFB",

    // argba colors for overlays
    overlayLight: "rgba(255, 255, 255, 0.7)",
    overlayDark: "rgba(0, 0, 0, 0.7)",
  },

  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  borderRadii: {
    xs: 4,
    s: 6,
    m: 12,
    l: 20,
    xl: 32,
    xxl: 40,
    rounded: 50,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "textSecondary",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  small: {
    fontSize: 12,
    color: "textSecondary",
  },
  error: {
    fontSize: 14,
    color: "danger",
  },
  textVariants: {
    body: {
      fontSize: 16,
      color: "text",
    },
    defaults: {
      fontSize: 16,
      color: "text",
      fontWeight: "400",
      lineHeight: 24,
    },
    subtitle: {
      fontSize: 16,
      color: "text",
      fontWeight: "500",
      lineHeight: 24,
    },
    hero: {
      fontSize: 32,
      fontWeight: "700",
      color: "text",
    },
    title: {
      fontSize: 22,
      fontWeight: "600",
      color: "text",
    },
    button: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
    },
    // ← AJOUT de toutes ces variantes
    caption: {
      fontSize: 14,
      color: "textSecondary",
      lineHeight: 20,
    },
    captionSmall: {
      fontSize: 12,
      color: "muted",
      lineHeight: 16,
    },
  },
});

export const Box = createBox();
export const Text = createText();

// custom buttons
export function Button({
  title,
  onPress,
  disabled = false,
  variant = "primary",
  ...props
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}>
      <Box
        backgroundColor={
          disabled ? "gray" : variant === "primary" ? "primary" : "secondary"
        }
        padding="m"
        borderRadius="m"
        alignItems="center"
        justifyContent="center"
        opacity={disabled ? 0.6 : 1}
        {...props}
      >
        <Text variant="button" color="white">
          {title}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
export default theme;
