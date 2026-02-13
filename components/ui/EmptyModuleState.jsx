import { Box, Button, Text } from "@/components/ui/theme";

export function EmptyModuleState({ onAdd }) {
  return (
    <Box
      marginTop="m"
      padding="l"
      borderWidth={1}
      borderColor="border"
      borderRadius="l"
      borderStyle="dashed"
      alignItems="center"
    >
      <Text variant="caption" color="muted">
        Aucun module créé pour le moment
      </Text>
      <Button
        title="Ajouter le premier module"
        variant="ghost"
        marginTop="s"
        onPress={onAdd}
      />
    </Box>
  );
}
