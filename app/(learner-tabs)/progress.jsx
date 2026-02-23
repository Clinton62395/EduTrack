import { useAuth } from "@/components/constants/authContext";
import { Box, Text } from "@/components/ui/theme";
import { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  UIManager,
} from "react-native";
import { useLearnerTrainings } from "../../components/features/learnerProfile/hooks/useLearnerTrainings";
import TrainingCollapse from "../../components/features/learnerProfile/learningColapse";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LearnerProgressScreen() {
  const { user } = useAuth();

  // ✅ Utilisation de ton hook existant
  const { myTrainings, loading } = useLearnerTrainings(user?.uid);
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading)
    return (
      <Box flex={1} justifyContent="center">
        <Text textAlign="center">Chargement...</Text>
      </Box>
    );

  return (
    <Box flex={1} backgroundColor="secondaryBackground">
      <Box
        padding="l"
        marginTop="l"
        backgroundColor="white"
        style={styles.header}
      >
        <Text variant="title">Ma Progression</Text>
        <Text variant="caption" color="muted">
          {myTrainings.length} formation{myTrainings.length > 1 ? "s" : ""} en
          cours
        </Text>
      </Box>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {myTrainings.map((training) => (
          <TrainingCollapse
            key={training.id}
            training={training}
            isExpanded={expandedId === training.id}
            onToggle={() => toggleExpand(training.id)}
            userId={user?.uid}
          />
        ))}
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
  },
});
