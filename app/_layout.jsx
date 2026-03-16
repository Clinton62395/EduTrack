import { NativeModules } from "react-native";

import { AuthProvider, useAuth } from "@/components/constants/authContext";
import { DevMenu } from "@/components/dev/freeRouting";
import { registerForPushNotificationsAsync } from "@/components/helpers/useNotificationforLearnerAttendance";
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
console.log("Modules natifs dispos :", Object.keys(NativeModules));
export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <PaperProvider>
          <SafeAreaProvider>
            <StatusBar
              style="auto"
              translucent={false}
              backgroundColor="#2563EB"
            />
            <GestureHandlerRootView style={{ flex: 1 }}>
              <AppContent />
            </GestureHandlerRootView>
            <DevMenu />
          </SafeAreaProvider>
        </PaperProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// ✅ Composant enfant — a accès au AuthProvider
function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      registerForPushNotificationsAsync(user.uid);
    }
  }, [user?.uid]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data.type === "ATTENDANCE") {
          router.push("/(learner-tabs)/attendance");
        }
        // ✅ Ajoute la redirection trainer
        if (
          data.type === "LESSON_COMPLETED" ||
          data.type === "CERTIFICATE_GENERATED"
        ) {
          router.push("/(trainer-tabs)/progress");
        }
      },
    );
    return () => subscription.remove();
  }, []);

  return <Slot />;
}
