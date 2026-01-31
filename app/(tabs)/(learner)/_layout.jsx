// app/(tabs)/(learner)/_layout.tsx (Version avec Dashboard)
import { Box } from "@/components/ui/theme";
import { Tabs } from "expo-router";
import {
  BookOpen, // Progression
  CalendarCheck,
  Home, // Formation
  TrendingUp, // Ressources
  UserCircle,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LearnerTabLayout() {
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
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tableau",
          tabBarIcon: ({ color, size, focused }) => (
            <Box position="relative">
              <Home size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && (
                <Box
                  position="absolute"
                  top={-6}
                  right={-6}
                  width={8}
                  height={8}
                  borderRadius='xs'
                  backgroundColor="primary"
                />
              )}
            </Box>
          ),
        }}
      />

      <Tabs.Screen
        name="training"
        options={{
          title: "Formation",
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
                  borderRadius= 'xs'
                  backgroundColor="primary"
                />
              )}
            </Box>
          ),
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: "Progression",
          tabBarIcon: ({ color, size, focused }) => (
            <Box position="relative">
              <TrendingUp
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
                  borderRadius='xs'
                  backgroundColor="primary"
                />
              )}
            </Box>
          ),
        }}
      />

      <Tabs.Screen
        name="attendance"
        options={{
          title: "Présence",
          tabBarIcon: ({ color, size, focused }) => (
            <Box position="relative">
              <CalendarCheck
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
                  borderRadius='xs'
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
            <Box position="relative">
              <UserCircle
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
                  borderRadius='xs'
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
