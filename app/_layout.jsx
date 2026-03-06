import { AuthProvider } from "@/components/constants/authContext";
import { DevMenu } from "@/components/dev/freeRouting";
import theme from "@/components/ui/theme";
import { ThemeProvider } from "@shopify/restyle";
import * as Notifications from "expo-notifications";
import { router, Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-gesture-handler"; // <-- À ajouter tout en haut si ce n'est pas fait
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
// 1. CONFIGURATION (À l'extérieur du composant)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export default function RootLayout() {
  useEffect(() => {
    // 2. REDIRECTION (Écoute le clic sur la notification)
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data.type === "ATTENDANCE") {
          // Redirige vers l'onglet Attendance du Learner
          router.push("/(learner-tabs)/attendance");
        }
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <PaperProvider>
          <SafeAreaProvider>
            <StatusBar style="light" backgroundColor="#2563EB" />

            <GestureHandlerRootView style={{ flex: 1 }}>
              <Slot />
            </GestureHandlerRootView>
            <DevMenu />
          </SafeAreaProvider>
        </PaperProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
