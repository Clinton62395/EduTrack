// app/(onboarding)/_layout.jsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function OnboardingLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#070C1F" translucent={false} />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}
