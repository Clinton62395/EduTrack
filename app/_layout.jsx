import { AuthProvider } from "@/components/constants/authContext";
import { DevMenu } from "@/components/dev/freeRouting";
import theme from "@/components/ui/theme";
import { ThemeProvider } from "@shopify/restyle";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler"; // <-- À ajouter tout en haut si ce n'est pas fait
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
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
