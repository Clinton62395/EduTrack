import { Text } from "@/components/ui/theme";
import { router } from "expo-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react-native";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <View style={s.root}>
      {/* ── FOND SOMBRE ── */}
      <View style={s.glow1} />
      <View style={s.glow2} />

      {/* ── CARD GLASSMORPHISME ── */}
      <View style={s.card}>
        {/* Ligne supérieure colorée */}
        <View style={s.topAccent} />

        {/* Icône */}
        <View style={s.iconWrap}>
          <View style={s.iconRing} />
          <View style={s.iconBox}>
            <AlertTriangle size={32} color="#F59E0B" />
          </View>
        </View>

        {/* Titre */}
        <Text style={s.title}>Une erreur est survenue</Text>

        {/* Message */}
        <Text style={s.subtitle}>
          L&apos;application a rencontré un problème inattendu. Vos données sont en
          sécurité.
        </Text>

        {/* Détail technique — discret */}
        {error?.message && (
          <View style={s.errorBox}>
            <Text style={s.errorText} numberOfLines={2}>
              {error.message}
            </Text>
          </View>
        )}

        {/* Boutons */}
        <View style={s.buttons}>
          <TouchableOpacity
            onPress={resetErrorBoundary}
            style={s.primaryBtn}
            activeOpacity={0.85}
          >
            <RefreshCw size={16} color="white" />
            <Text style={s.primaryBtnText}>Réessayer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              resetErrorBoundary();
              router.replace("/(auth)/login");
            }}
            style={s.secondaryBtn}
            activeOpacity={0.85}
          >
            <Home size={16} color="rgba(255,255,255,0.7)" />
            <Text style={s.secondaryBtnText}>Accueil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <Text style={s.footer}>EduTrack · Tous droits réservés</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0F2E",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  // Lueurs
  glow1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "#2563EB",
    opacity: 0.1,
    top: -100,
    left: -100,
  },
  glow2: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#F59E0B",
    opacity: 0.07,
    bottom: -80,
    right: -80,
  },

  // Card
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 28,
    alignItems: "center",
    overflow: "hidden",
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: 60,
    right: 60,
    height: 2,
    backgroundColor: "#F59E0B",
    borderRadius: 1,
  },

  // Icône
  iconWrap: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  iconRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.2)",
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(245,158,11,0.15)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Textes
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },

  // Boîte erreur technique
  errorBox: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  errorText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    fontFamily: "monospace",
    textAlign: "center",
  },

  // Boutons
  buttons: {
    width: "100%",
    gap: 10,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#2563EB",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 14,
    borderRadius: 14,
  },
  secondaryBtnText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    fontWeight: "600",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 32,
    fontSize: 11,
    color: "rgba(255,255,255,0.2)",
  },
});
