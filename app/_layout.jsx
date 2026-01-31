import theme, { Box } from "@/components/ui/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@shopify/restyle";
import { Redirect, Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem(
          "@edutrack_onboarding_seen",
        );

        setInitialRoute(
          hasSeenOnboarding === "true" ? "/(auth)/login" : "/(onboarding)",
        );
      } catch {
        setInitialRoute("/(auth)/login");
      }
    })();
  }, []);

  if (!initialRoute) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <ActivityIndicator size="large" color="#2563EB" />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Redirect href={initialRoute} />
          <Slot />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
