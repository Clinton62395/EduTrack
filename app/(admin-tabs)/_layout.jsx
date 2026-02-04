// app/(tabs)/(admin)/_layout.tsx
import { Box } from "@/components/ui/theme";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BarChart3,
  BookOpen,
  GraduationCap,
  User,
  Users,
} from "lucide-react-native";

export default function AdminTabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarActiveTintColor: "#2563EB", // primary
        tabBarInactiveTintColor: "#6B7280", // muted
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Formations",
          tabBarIcon: ({ color, size, focused }) => (
            <Box position="relative">
              <BookOpen
                size={size}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Box
                  position="absolute"
                  top={-6}
                  right={-6}
                  width={8}
                  height={8}
                  borderRadius="xs"
                  backgroundColor="primary"
                />
              )}
            </Box>
          ),
        }}
      />

      <Tabs.Screen
        name="trainers"
        options={{
          title: "Formateurs",
          tabBarIcon: ({ color, size, focused }) => (
            <Box position="relative">
              <Users
                size={size}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Box
                  position="absolute"
                  top={-6}
                  right={-6}
                  width={8}
                  height={8}
                  borderRadius="xs"
                  backgroundColor="primary"
                />
              )}
            </Box>
          ),
        }}
      />

      <Tabs.Screen
        name="learners"
        options={{
          title: "Apprenants",
          tabBarIcon: ({ color, size, focused }) => (
            <Box position="relative">
              <GraduationCap
                size={size}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Box
                  position="absolute"
                  top={-6}
                  right={-6}
                  width={8}
                  height={8}
                  borderRadius="xs"
                  backgroundColor="primary"
                />
              )}
            </Box>
          ),
        }}
      />

      <Tabs.Screen
        name="statistical"
        options={{
          title: "Stats",
          tabBarIcon: ({ color, size, focused }) => (
            <Box position="relative">
              <BarChart3
                size={size}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Box
                  position="absolute"
                  top={-6}
                  right={-6}
                  width={8}
                  height={8}
                  borderRadius="xs"
                  backgroundColor="primary"
                />
              )}
            </Box>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <Box
              position="relative"
              alignItems="center"
              justifyContent="center"
            >
              <User size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && (
                <Box
                  position="absolute"
                  top={-6}
                  right={-4}
                  width={8}
                  height={8}
                  borderRadius="xs"
                  backgroundColor="primary"
                />
              )}
            </Box>
          ),
        }}
      />
    </Tabs>
  );
}
