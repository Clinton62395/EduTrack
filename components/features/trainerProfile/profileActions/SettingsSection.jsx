import { router } from "expo-router";
import { Bell, Briefcase, ChevronRight, Shield } from "lucide-react-native";
import { Pressable } from "react-native";
import { Box, Text } from "@/components/ui/theme";

function SettingsRow({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingVertical="s"
      >
        <Box flexDirection="row" gap="m" alignItems="center">
          {icon}
          <Text variant="body">{label}</Text>
        </Box>
        <ChevronRight size={20} color="#6B7280" />
      </Box>
    </Pressable>
  );
}

export function SettingsSection() {
  return (
    <>
      {/* Notifications — card séparée */}
      <Box
        marginHorizontal="m"
        marginTop="m"
        backgroundColor="white"
        borderRadius="l"
        paddingHorizontal="l"
        paddingVertical="m"
      >
        <SettingsRow
          icon={<Bell size={20} color="#6B7280" />}
          label="Notifications"
          onPress={() => router.push("/settings/notifications")}
        />
      </Box>

      {/* Sécurité + À propos — même card */}
      <Box
        marginHorizontal="m"
        marginTop="m"
        backgroundColor="white"
        borderRadius="l"
        padding="m"
      >
        <Text variant="body" fontWeight="700" marginBottom="s">
          Sécurité
        </Text>
        <SettingsRow
          icon={<Shield size={20} color="#6B7280" />}
          label="Changer le mot de passe"
          onPress={() => router.push("/settings/security")}
        />

        <Box height={1} backgroundColor="secondaryBackground" marginVertical="s" />

        <Text variant="body" fontWeight="700" marginBottom="s">
          À propos
        </Text>
        <SettingsRow
          icon={<Briefcase size={20} color="#6B7280" />}
          label="À propos de l'application"
          onPress={() => router.push("/settings/aboutApp")}
        />
      </Box>
    </>
  );
}
