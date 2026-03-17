// components/modal/EmailValidationBottomSheet.jsx
import { Box, Button, ms, Text } from "@/components/ui/theme";
import { AlertCircle, CheckCircle, Mail, X } from "lucide-react-native";
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function EmailValidationModal({ visible, onClose, email }) {
  const handleOpenEmailApp = async () => {
    try {
      let url = Platform.OS === "ios" ? "message://" : "mailto:";
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
        setTimeout(onClose, 1500);
      } else {
        Alert.alert("Ouvrir l'email", "Choisissez votre application email :", [
          { text: "Gmail", onPress: () => Linking.openURL("googlegmail://") },
          { text: "Outlook", onPress: () => Linking.openURL("ms-outlook://") },
          { text: "Annuler", style: "cancel" },
        ]);
      }
    } catch (error) {
      console.error("Erreur ouverture email:", error);
      Alert.alert("Erreur", "Impossible d'ouvrir l'application email.");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* 1. Root container pour capturer les gestes dans le Modal */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* 2. Fond semi-transparent et gestion clavier */}
        <View style={styles.overlay}>
          {/* 3. Pressable invisible en arrière-plan pour fermer au clic dehors */}
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          {/* 4. La Bottom Sheet elle-même */}
          <Box
            backgroundColor="white"
            borderTopLeftRadius="xl"
            borderTopRightRadius="xl"
            style={styles.sheetContainer}
          >
            {/* Header Fixe */}
            <Box
              padding="l"
              borderBottomWidth={1}
              borderBottomColor="border"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              backgroundColor="white"
            >
              <Text variant="title" style={{ fontSize: 18, fontWeight: "700" }}>
                Vérifiez votre email
              </Text>
              <Pressable onPress={onClose} hitSlop={20}>
                <X size={24} color="#6B7280" />
              </Pressable>
            </Box>

            {/* 5. ScrollView NATIF pour éviter les conflits avec le Modal */}
            <ScrollView
              showsVerticalScrollIndicator={true}
              bounces={true}
              contentContainerStyle={styles.scrollContent}
            >
              <Box alignItems="center" gap="m">
                {/* Icône succès */}
                <Box
                  backgroundColor="secondary"
                  borderRadius="rounded"
                  padding="l"
                  marginBottom="s"
                >
                  <CheckCircle size={56} color="white" />
                </Box>

                <Text variant="title" textAlign="center">
                  Inscription réussie ! 🎉
                </Text>

                <Text
                  variant="body"
                  textAlign="center"
                  color="muted"
                  lineHeight={22}
                >
                  Votre compte a été créé avec succès.{"\n"}
                  Une dernière étape : validez votre email.
                </Text>

                {/* Encadré Email */}
                <Box
                  backgroundColor="background"
                  padding="m"
                  borderRadius="m"
                  width="100%"
                  borderWidth={1}
                  borderColor="border"
                  marginVertical="m"
                >
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    gap="s"
                    marginBottom="xs"
                  >
                    <Mail size={20} color="#2563EB" />
                    <Text variant="subtitle" fontWeight="600">
                      Email envoyé à :
                    </Text>
                  </Box>
                  <Text
                    variant="body"
                    color="primary"
                    fontWeight="700"
                    textAlign="center"
                  >
                    {email || "votre@email.com"}
                  </Text>
                </Box>

                {/* Liste d'instructions */}
                <Box width="100%" gap="s">
                  {[
                    "Ouvrez votre boîte email",
                    "Cliquez sur le lien",
                    "Revenez vous connecter",
                  ].map((item, idx) => (
                    <Box key={idx} flexDirection="row" gap="s">
                      <Text variant="body" fontWeight="700">
                        {idx + 1}.
                      </Text>
                      <Text variant="body" flex={1}>
                        {item}
                      </Text>
                    </Box>
                  ))}
                </Box>

                {/* Alerte Spam */}
                <Box
                  flexDirection="row"
                  alignItems="center"
                  gap="s"
                  padding="m"
                  borderRadius="m"
                  width="100%"
                  marginTop="s"
                  backgroundColor="warningBackground"
                >
                  <AlertCircle size={20} color="#F59E0B" />
                  <Text variant="caption" flex={1}>
                    💡 Pensez à vérifier vos <Text fontWeight="700">spams</Text>
                    .
                  </Text>
                </Box>

                {/* Boutons */}
                <Box width="100%" gap="s" marginTop="l">
                  <Button
                    title="Ouvrir ma boîte email"
                    onPress={handleOpenEmailApp}
                    icon={<Mail size={20} color="white" />}
                  />
                  <Button
                    title="Je validerai plus tard"
                    onPress={onClose}
                    variant="outline"
                  />
                </Box>

                <Text
                  variant="caption"
                  color="muted"
                  textAlign="center"
                  marginTop="m"
                >
                  ⚠️ Validation requise pour la connexion.
                </Text>
              </Box>
            </ScrollView>
          </Box>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    width: "100%",
    maxHeight: SCREEN_HEIGHT * 0.85,
    elevation: ms(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: ms(-3) },
    shadowOpacity: 0.1,
    shadowRadius: ms(5),
  },
  scrollContent: {
    padding: ms(24),
    paddingBottom: Platform.OS === "ios" ? ms(80) : ms(60),
  },
});
