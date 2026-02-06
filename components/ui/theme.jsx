// theme.js
import { createBox, createText, createTheme } from "@shopify/restyle";
import { TouchableOpacity } from "react-native";

const theme = createTheme({
  colors: {
    primary: "#2563EB",
    primaryDark: "#1D4ED8", // Pour les états pressés
    secondary: "#16A34A",
    secondaryDark: "#F1F5F9", // Pour les états pressés
    background: "#ffffff",
    cardBackground: "#FFFFFF",
    text: "#0F172A",
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
    outline: "#94A3B8",
    muted: "#64748B",
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
      lineHeight: 24,
    },
    defaults: {
      fontSize: 16,
      color: "text",
      fontWeight: "400",
      lineHeight: 24,
    },
    subtitle: {
      fontSize: 18,
      color: "text",
      fontWeight: "600",
    },
    hero: {
      fontSize: 34,
      fontWeight: "800",
      color: "primary",
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: "text",
      lineHeight: 32,
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
  icon = null,
  iconPosition = "left",
  variant = "primary",
  ...props
}) {
  const colors = {
    primary: "primary",
    secondary: "secondary",
    warning: "warning",
    info: "info",
    success: "success",
    error: "error",
    gray: "gray",
    outline: "outline",
  };
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7}>
      <Box
        backgroundColor={
          disabled ? "gray" : colors[variant] || "primary"
          // Note : j'utilise 'text' (noir) pour le variant secondary pour un look pro
        }
        paddingVertical="m"
        paddingHorizontal="l"
        borderRadius="m"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap="s"
        style={{ elevation: 2, shadowOpacity: 0.1, shadowRadius: 3 }} // Petit relief
        {...props}
      >
        <Text variant="button" color="white">
          {title}
        </Text>
        {/* Icône à droite */}
        {icon && iconPosition === "right" && <Box marginLeft="s">{icon}</Box>}
      </Box>
    </TouchableOpacity>
  );
}
export default theme;
