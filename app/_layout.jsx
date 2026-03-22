import { AuthProvider, useAuth } from "@/components/constants/authContext";
import { registerForPushNotificationsAsync } from "@/components/helpers/useNotificationforLearnerAttendance";
import { MyLoader } from "@/components/ui/loader";
import theme from "@/components/ui/theme";
import { ThemeProvider } from "@shopify/restyle";
import * as Notifications from "expo-notifications";
import { router, Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { NativeModules } from "react-native";
import "react-native-gesture-handler"; // <-- À ajouter tout en haut si ce n'est pas fait
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorFallback } from "../components/ui/ErrorBoundryFallback";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://2d403e7a1cd7a301b694cad7ca93871e@o4510782282858496.ingest.de.sentry.io/4511089356963920',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});
// 1. CONFIGURATION (À l'extérieur du composant)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
console.log("Modules natifs dispos :", Object.keys(NativeModules));
export default Sentry.wrap(function RootLayout() {
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
            {/* <DevMenu /> */}
          </SafeAreaProvider>
        </PaperProvider>
      </ThemeProvider>
    </AuthProvider>
  );
});

// ✅ Composant enfant — a accès au AuthProvider
function AppContent() {
  const { user, loading } = useAuth();

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

  if (loading) {
    return <MyLoader message="Déconnexion…" />;
  }

  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Slot />
      </ErrorBoundary>
    </>
  );
}
