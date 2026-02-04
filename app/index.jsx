// app/index.jsx
import { useAuth } from "@/components/constants/authContext";
import { UserRoleRedirect } from "@/components/ui/roleBase";
import { Box, Text } from "@/components/ui/theme";
import React from "react";
import { ActivityIndicator } from "react-native";
import Animated from "react-native-reanimated";

const AnimatedBox = Animated.createAnimatedComponent(Box);

export default function Index() {
  const { user, loading } = useAuth();

  // ✅ Pendant le chargement, afficher un loader
  if (loading) {
    return (
      <AnimatedBox
        flex={1}
        backgroundColor="background"
        justifyContent="center"
        alignItems="center"
      >
        <ActivityIndicator size="large" color="#0000ff" />
        <Text variant="body" color="muted" marginTop="m">
          Chargement...
        </Text>
      </AnimatedBox>
    );
  }

  // ✅ Rediriger selon le rôle
  return <UserRoleRedirect role={user?.role || null} />;
}
