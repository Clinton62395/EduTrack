import { Briefcase, DollarSign } from "lucide-react-native";
import { ProfileField } from "@/components/common/profileField";
import { ProfileSection } from "@/components/common/profileSection";
import { Box } from "@/components/ui/theme";

export function ExpertiseSection({ user, onUpdate }) {
  return (
    <Box
      marginHorizontal="m"
      marginTop="m"
      backgroundColor="white"
      borderRadius="l"
      paddingBottom="m"
    >
      <ProfileSection title="Expertise & Tarifs">
        <ProfileField
          label="Spécialité"
          value={user?.specialite}
          placeholder="React Native, Web..."
          onSave={(v) => onUpdate("specialite", v)}
          icon={<Briefcase size={18} color="#6B7280" />}
        />
        <ProfileField
          label="Tarif Journalier"
          value={user?.tarif}
          placeholder="Ex: 500€/jour"
          onSave={(v) => onUpdate("tarif", v)}
          icon={<DollarSign size={18} color="#6B7280" />}
        />
        <ProfileField
          label="Bio"
          value={user?.bio}
          multiline
          onSave={(v) => onUpdate("bio", v)}
        />
      </ProfileSection>
    </Box>
  );
}
