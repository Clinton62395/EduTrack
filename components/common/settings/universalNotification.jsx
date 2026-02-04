import { Box, Text } from "@/components/ui/theme";
import { useNotifications } from "@/hooks/useNotification";
import { router } from "expo-router";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  Mail,
  MessageSquare,
  Smartphone,
} from "lucide-react-native";
import { Pressable, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function UniversalNotificationsScreen() {
  const { prefs, togglePref, themeColor } = useNotifications();

  const NotificationItem = ({
    icon: Icon,
    title,
    subtitle,
    value,
    onToggle,
  }) => (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingVertical="m"
      borderBottomWidth={1}
      borderBottomColor="border"
    >
      <Box flexDirection="row" alignItems="center" gap="m" flex={1}>
        <Box backgroundColor="secondaryBackground" padding="s" borderRadius="m">
          <Icon size={22} color="#4B5563" />
        </Box>
        <Box flex={1}>
          <Text variant="body" fontWeight="600">
            {title}
          </Text>
          <Text variant="caption" color="muted">
            {subtitle}
          </Text>
        </Box>
      </Box>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#D1D5DB", true: "#93C5FD" }} // Couleur de fond
        thumbColor={value ? "#2563EB" : "#F3F4F6"} // Couleur de la pastille
      />
    </Box>
  );

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <Box
          flexDirection="row"
          alignItems="center"
          padding="m"
          gap="m"
          backgroundColor="white"
        >
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={24} color="black" />
          </Pressable>
          <Text variant="title">Notifications</Text>
        </Box>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Box alignItems="center" marginVertical="l">
            <Box
              backgroundColor={themeColor}
              padding="m"
              borderRadius="rounded"
            >
              <Bell size={40} color="white" />
            </Box>
            <Text variant="body" color="muted" marginTop="s">
              Configurez comment EduTrack vous alerte
            </Text>
          </Box>

          {/* SECTION : CANAUX */}
          <Text
            variant="caption"
            fontWeight="700"
            marginBottom="s"
            marginLeft="s"
          >
            CANAUX D'ENVOI
          </Text>
          <Box
            backgroundColor="white"
            borderRadius="l"
            paddingHorizontal="m"
            marginBottom="l"
          >
            <NotificationItem
              icon={Smartphone}
              title="Notifications Push"
              subtitle="Alertes directes sur votre téléphone"
              value={prefs.push}
              onToggle={() => togglePref("push")}
            />
            <NotificationItem
              icon={Mail}
              title="Emails"
              subtitle="Récapitulatifs et alertes importantes"
              value={prefs.email}
              onToggle={() => togglePref("email")}
            />
          </Box>

          {/* SECTION : ACTIVITÉS */}
          <Text
            variant="caption"
            fontWeight="700"
            marginBottom="s"
            marginLeft="s"
          >
            ACTIVITÉS
          </Text>
          <Box backgroundColor="white" borderRadius="l" paddingHorizontal="m">
            <NotificationItem
              icon={BookOpen}
              title="Nouvelles Formations"
              subtitle="Dès qu'un cours est disponible ou mis à jour"
              value={prefs.formations}
              onToggle={() => togglePref("formations")}
            />
            <NotificationItem
              icon={MessageSquare}
              title="Messages"
              subtitle="Commentaires et discussions privées"
              value={prefs.messages}
              onToggle={() => togglePref("messages")}
            />
          </Box>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
