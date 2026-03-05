import { Mail, MapPin, Phone } from "lucide-react-native";
import { ProfileField } from "@/components/common/profileField";
import { ProfileSection } from "@/components/common/profileSection";
import { Box } from "@/components/ui/theme";

export function PersonalInfoSection({ user, onUpdate }) {
  return (
    <Box
      marginHorizontal="m"
      marginTop="m"
      backgroundColor="white"
      borderRadius="l"
      paddingBottom="m"
    >
      <ProfileSection title="Informations Personnelles">
        <ProfileField
          label="Nom complet"
          value={user?.name}
          onSave={(v) => onUpdate("name", v)}
        />
        <ProfileField
          label="Email professionnel"
          value={user?.email}
          editable={false}
          icon={<Mail size={18} color="#6B7280" />}
        />
        <ProfileField
          label="Téléphone"
          value={user?.phone}
          placeholder="+224..."
          onSave={(v) => onUpdate("phone", v)}
          icon={<Phone size={18} color="#6B7280" />}
        />
        <ProfileField
          label="Localisation"
          value={user?.location}
          onSave={(v) => onUpdate("location", v)}
          icon={<MapPin size={18} color="#6B7280" />}
        />
      </ProfileSection>
    </Box>
  );
}
