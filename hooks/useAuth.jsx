// // app/(tabs)/index.tsx
// import { useAuth } from "@/hooks/useAuth";
// import { Redirect } from "expo-router";

// export default function Index() {
//   const { user } = useAuth();

//   if (!user) return <Redirect href="/(auth)/login" />;

//   // Redirige vers le groupe approprié selon le rôle
//   switch (user.role) {
//     case "admin":
//       return <Redirect href="/(tabs)/(admin)" />;
//     case "trainer":
//       return <Redirect href="/(tabs)/(trainer)" />;
//     case "learner":
//       return <Redirect href="/(tabs)/(learner)" />;
//     default:
//       return <Redirect href="/(auth)/login" />;
//   }
// }
