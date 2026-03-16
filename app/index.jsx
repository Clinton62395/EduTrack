// app/index.jsx
import { useAuth } from "@/components/constants/authContext";
import { MyLoader } from "@/components/ui/loader";
import { UserRoleRedirect } from "@/components/ui/roleBase";
import { Box } from "@/components/ui/theme";
import React from "react";
import Animated from "react-native-reanimated";

const AnimatedBox = Animated.createAnimatedComponent(Box);

export default function Index() {
  const { user, loading } = useAuth();

  // ✅ Pendant le chargement, afficher un loader
  if (loading) {
    return (
      <AnimatedBox>
        <MyLoader />
      </AnimatedBox>
    );
  }

  // ✅ Rediriger selon le rôle
  return <UserRoleRedirect role={user?.role || null} />;
}
