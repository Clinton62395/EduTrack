import { AuthProvider } from "@/components/constants/authContext";
import { StatusBar } from "expo-status-bar";

import { DevMenu } from "@/components/dev/freeRouting";
import theme from "@/components/ui/theme";
import { ThemeProvider } from "@shopify/restyle";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            {/* <StatusBar
              style="light"
              backgroundColor="#2563EB"
              translucent={false}
            />{" "} */}
            <Slot />
            <DevMenu />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
