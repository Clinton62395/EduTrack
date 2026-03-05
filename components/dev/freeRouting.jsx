// components/dev/DevMenu.jsx
import { auth } from "@/components/lib/firebase";
import { Box, Button, Text } from "@/components/ui/theme";
import { router } from "expo-router";
// removed firebase/auth import
import { Settings } from "lucide-react-native";
import { useState } from "react";
import { Alert, Modal, TouchableOpacity } from "react-native";

export function DevMenu() {
  const [visible, setVisible] = useState(false);

  // N'afficher qu'en développement
  if (__DEV__ === false) return null;

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await auth.signOut();
          router.replace("/(auth)/login");
          setVisible(false);
        },
      },
    ]);
  };

  const quickNav = (route) => {
    setVisible(false);
    router.push(route);
  };

  return (
    <>
      {/* Bouton flottant pour ouvrir le menu */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          position: "absolute",
          bottom: 150,
          right: 20,
          backgroundColor: "#FF6B6B",
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <Settings color="white" size={24} />
      </TouchableOpacity>

      {/* Modal du menu dev */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            backgroundColor="white"
            borderTopLeftRadius="xl"
            borderTopRightRadius="xl"
            padding="xl"
          >
            <Text variant="title" marginBottom="l">
              🛠️ Menu Développement
            </Text>

            <Box gap="m">
              {/* Navigation rapide */}
              <Text variant="subtitle" color="muted">
                Navigation rapide
              </Text>

              <Button
                title="🎓 Dashboard Learner"
                variant="secondary"
                onPress={() => quickNav("/(learner-tabs)")}
              />

              <Button
                title="👨‍🏫 Dashboard Trainer"
                variant="secondary"
                onPress={() => quickNav("/(trainer-tabs)")}
              />

              <Button
                title="👑 Dashboard Admin"
                variant="secondary"
                onPress={() => quickNav("/(admin-tabs)")}
              />

              <Box height={1} backgroundColor="border" marginVertical="m" />

              {/* Auth */}
              <Text variant="subtitle" color="muted">
                Authentification
              </Text>

              <Button
                title="🔐 Login"
                variant="secondary"
                onPress={() => quickNav("/(auth)/login")}
              />

              <Button
                title="📝 Register"
                variant="secondary"
                onPress={() => quickNav("/(auth)/register")}
              />

              <Box height={1} backgroundColor="border" marginVertical="m" />

              {/* Actions */}
              <Button
                title="🚪 Déconnexion"
                variant="destructive"
                onPress={handleLogout}
              />

              <Button
                title="Fermer"
                variant="outline"
                onPress={() => setVisible(false)}
                marginTop="s"
              />
            </Box>
          </Box>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
