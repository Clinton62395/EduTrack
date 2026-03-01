import { Platform, View } from "react-native";

// On utilise un require dynamique pour éviter que le module
// ne soit chargé sur Android si le package pose problème.
let BlurView;
try {
  if (Platform.OS === "ios") {
    BlurView = require("expo-blur").BlurView;
  }
} catch (e) {
  BlurView = null;
}

export const GlassContainer = ({
  children,
  style,
  intensity = 80,
  tint = "light",
}) => {
  // On vérifie à la fois la plateforme ET si le module a bien été chargé
  if (Platform.OS === "ios" && BlurView) {
    return (
      <BlurView intensity={intensity} tint={tint} style={style}>
        {children}
      </BlurView>
    );
  }

  // Fallback sécurisé pour Android, le Web ou en cas d'erreur iOS
  return (
    <View
      style={[
        style,
        {
          backgroundColor:
            tint === "light"
              ? "rgba(255, 255, 255, 0.95)"
              : "rgba(30, 41, 59, 0.8)",
          borderWidth: Platform.OS === "android" ? 1 : 0,
          borderColor: "rgba(226, 232, 240, 0.5)",
          // On ajoute une petite élévation pour compenser l'absence de flou sur Android
          elevation: 2,
        },
      ]}
    >
      {children}
    </View>
  );
};
