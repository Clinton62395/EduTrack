// components/formations/FormationCard.jsx
import { Box, Text } from "@/components/ui/theme";
import {
  Calendar,
  ChevronRight,
  MoreVertical,
  TrendingUp,
  Users,
} from "lucide-react-native";
import { Alert, TouchableOpacity, View } from "react-native";

export function TrainingCards({
  formation,
  onPress,
  onOptionsPress,
  showActions = true,
}) {
  const getStatusColor = () => {
    switch (formation.status) {
      case "ongoing":
        return "secondary";
      case "upcoming":
        return "warning";
      case "completed":
        return "textSecondary";
      default:
        return "textSecondary";
    }
  };

  const getStatusLabel = () => {
    switch (formation.status) {
      case "ongoing":
        return "En cours";
      case "upcoming":
        return "À venir";
      case "completed":
        return "Terminée";
      default:
        return formation.status;
    }
  };

  console.log(" formation==>", formation);
  const handleShareCode = () => {
    Alert.alert(
      "Code d'invitation",
      `Code : ${formation.invitationCode}\n\nPartagez ce code avec vos apprenants pour qu'ils puissent s'inscrire.`,
      [
        {
          text: "Copier",
          onPress: () => {
            // Ici tu pourrais copier dans le clipboard
            Alert.alert("Copié !", "Code copié dans le presse-papier");
          },
        },
        { text: "OK" },
      ],
    );
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Box
        backgroundColor="white"
        borderRadius="l"
        borderWidth={1}
        borderColor="border"
        marginBottom="m"
        overflow="hidden"
        shadowColor="overlayDark"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.05}
        shadowRadius={8}
      >
        {/* En-tête avec couleur */}
        <Box height={4} backgroundColor="primary" />

        {/* Contenu */}
        <Box padding="m">
          {/* Ligne 1 : Titre et statut */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
            marginBottom="s"
          >
            <Box flex={1}>
              <Text variant="subtitle" fontWeight="600" numberOfLines={1}>
                {formation.title}
              </Text>
              <Text variant="caption" color="muted" numberOfLines={1}>
                {formation.category}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center" gap="s">
              {/* <Box
                backgroundColor={`${getStatusColor()}15`}
                paddingHorizontal="s"
                paddingVertical="xs"
                borderRadius="s"
              > */}
              <View style={{ backgroundColor: `${getStatusColor()}15` }}>
                <Text
                  variant="caption"
                  color={getStatusColor()}
                  fontWeight="500"
                >
                  {getStatusLabel()}
                </Text>
              </View>
              {/* </Box> */}

              {showActions && onOptionsPress && (
                <TouchableOpacity onPress={onOptionsPress}>
                  <MoreVertical size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </Box>
          </Box>

          {/* Description */}
          <Text variant="body" color="text" numberOfLines={2} marginBottom="m">
            {formation.description}
          </Text>

          {/* Statistiques */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            marginBottom="m"
          >
            <Box flexDirection="row" alignItems="center" gap="xs">
              <Users size={16} color="#6B7280" />
              <Text variant="caption" color="muted">
                {formation.currentLearners}/{formation.maxLearners}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center" gap="xs">
              <Calendar size={16} color="#6B7280" />
              <Text variant="caption" color="muted">
                {formation.schedule}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center" gap="xs">
              <TrendingUp size={16} color="#6B7280" />
              <Text variant="caption" color="muted">
                {formation.progressionRate}%
              </Text>
            </Box>
          </Box>

          {/* Progression */}
          <Box marginBottom="s">
            <Box
              flexDirection="row"
              justifyContent="space-between"
              marginBottom="xs"
            >
              <Text variant="caption" color="muted">
                Progression
              </Text>
              <Text variant="caption" color="muted">
                {formation.completedModules}/{formation.modules} modules
              </Text>
            </Box>
            <Box
              height={6}
              backgroundColor="border"
              borderRadius="s"
              overflow="hidden"
            >
              <Box
                width={`${(formation.completedModules / formation.modules) * 100}%`}
                height="100%"
                backgroundColor="primary"
              />
            </Box>
          </Box>

          {/* Actions */}
          {showActions && (
            <Box
              flexDirection="row"
              justifyContent="space-between"
              marginTop="s"
            >
              <TouchableOpacity onPress={handleShareCode}>
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <Box backgroundColor="primary" padding="s" borderRadius="s">
                    <Text variant="caption" color="white" fontWeight="600">
                      {formation.invitationCode}
                    </Text>
                  </Box>
                  <Text variant="caption" color="white">
                    Code d&apos;invitation
                  </Text>
                </Box>
              </TouchableOpacity>

              <TouchableOpacity onPress={onPress}>
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <Text variant="action">Voir détails</Text>
                  <ChevronRight size={16} color="#3B82F6" />
                </Box>
              </TouchableOpacity>
            </Box>
          )}
        </Box>
      </Box>
    </TouchableOpacity>
  );
}
