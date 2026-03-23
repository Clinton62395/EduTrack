import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

const { width: W, height: H } = Dimensions.get("window");

// Import du logo pour éviter les problèmes en production
const logoImage = require("../../assets/images/logo.png");

// ✅ Empêche le splash natif de se masquer automatiquement
SplashScreen.preventAutoHideAsync();

/**
 * AnimatedSplash
 * @param {boolean} isReady — true quand l'app est prête (auth + firebase chargés)
 * @param {ReactNode} children — le contenu de l'app
 */
export function AnimatedSplash({ isReady, children }) {
  // ── Valeurs animées
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(1)).current;

  // Lueurs
  const glow1Opacity = useRef(new Animated.Value(0)).current;
  const glow2Opacity = useRef(new Animated.Value(0)).current;

  // Points de chargement
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // ── Séquence d'entrée
    Animated.sequence([
      // 1. Lueurs apparaissent
      Animated.parallel([
        Animated.timing(glow1Opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(glow2Opacity, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]),

      // 2. Logo apparaît avec spring
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 7,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      // 3. Nom de l'app
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),

      // 4. Tagline
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // 5. Points de chargement
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation des points en boucle
    const dotAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot1, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    );
    dotAnimation.start();

    return () => dotAnimation.stop();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // ── Séquence de sortie quand l'app est prête
    Animated.sequence([
      // Petite pause pour que l'utilisateur voit le logo
      Animated.delay(300),

      // Fade out + léger zoom
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(splashScale, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]),
    ]).start(async () => {
      // Masque le splash natif
      await SplashScreen.hideAsync();
    });
  }, [isReady]);

  return (
    <View style={s.root}>
      {/* ── CONTENU APP (en dessous) ── */}
      <View style={StyleSheet.absoluteFillObject}>{children}</View>

      {/* ── SPLASH ANIMÉ (par-dessus) ── */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          s.splash,
          {
            opacity: splashOpacity,
            transform: [{ scale: splashScale }],
          },
        ]}
        pointerEvents={isReady ? "none" : "auto"}
      >
        {/* Fond sombre */}
        <View style={s.bg} />

        {/* Lueur bleue */}
        <Animated.View style={[s.glow1, { opacity: glow1Opacity }]} />

        {/* Lueur violette */}
        <Animated.View style={[s.glow2, { opacity: glow2Opacity }]} />

        {/* Grille décorative subtile */}
        <View style={s.gridOverlay} />

        {/* Contenu centré */}
        <View style={s.content}>
          {/* Logo */}
          <Animated.View
            style={[
              s.logoWrap,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            {/* Anneau extérieur */}
            <View style={s.logoRingOuter} />
            {/* Anneau intérieur */}
            <View style={s.logoRingInner} />
            {/* Box bleue avec logo */}
            <View style={s.logoBox}>
              <Image
                source={logoImage}
                style={s.logoImage}
                contentFit="cover"
              />
            </View>
          </Animated.View>

          {/* Nom de l'app */}
          <Animated.Text style={[s.appName, { opacity: textOpacity }]}>
            EduTrack
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text style={[s.tagline, { opacity: taglineOpacity }]}>
            Formez · Progressez · Certifiez
          </Animated.Text>
        </View>

        {/* Points de chargement en bas */}
        <Animated.View style={[s.dotsWrap, { opacity: dotsOpacity }]}>
          <Animated.View style={[s.dot, { opacity: dot1 }]} />
          <Animated.View style={[s.dot, { opacity: dot2 }]} />
          <Animated.View style={[s.dot, { opacity: dot3 }]} />
        </Animated.View>

        {/* Copyright en bas */}
        <Animated.Text style={[s.copyright, { opacity: taglineOpacity }]}>
          © 2026 EduTrack
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A0F2E",
  },

  // Lueurs
  glow1: {
    position: "absolute",
    width: W * 1.2,
    height: W * 1.2,
    borderRadius: W * 0.6,
    backgroundColor: "#2563EB",
    opacity: 0,
    top: -W * 0.4,
    left: -W * 0.1,
  },
  glow2: {
    position: "absolute",
    width: W * 0.9,
    height: W * 0.9,
    borderRadius: W * 0.45,
    backgroundColor: "#7C3AED",
    opacity: 0,
    bottom: -W * 0.3,
    right: -W * 0.2,
  },

  // Grille décorative
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: "transparent",
  },

  // Logo
  content: {
    alignItems: "center",
    gap: 16,
  },
  logoWrap: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  logoRingOuter: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.2)",
  },
  logoRingInner: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.15)",
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },

  // Textes
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: "white",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // Points de chargement
  dotsWrap: {
    position: "absolute",
    bottom: H * 0.12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
  },

  // Copyright
  copyright: {
    position: "absolute",
    bottom: H * 0.06,
    fontSize: 11,
    color: "rgba(255,255,255,0.15)",
    letterSpacing: 0.5,
  },
});
