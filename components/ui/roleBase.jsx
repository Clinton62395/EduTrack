// components/ui/roleBase.jsx
import { useAuth } from "@/components/constants/authContext";
import { Redirect } from "expo-router";
import { ActivityIndicator } from "react-native";
import { Box } from "./theme";

export function UserRoleRedirect({ role }) {
  const { loading } = useAuth();

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <Box style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </Box>
    );
  }

  // Pas d'utilisateur → Onboarding
  if (!role) {
    return <Redirect href="/(onboarding)" />;
  }

  // Redirection selon le rôle
  if (role === "learner") {
    return <Redirect href="/(learner-tabs)/" />;
  }

  if (role === "trainer") {
    return <Redirect href="/(trainer-tabs)/" />;
  }
  // Rôle admin
  if (role === "admin") {
    return <Redirect href="/(admin-tabs)/" />;
  }

  // Rôle inconnu → Onboarding
  return <Redirect href="/(onboarding)" />;
}
