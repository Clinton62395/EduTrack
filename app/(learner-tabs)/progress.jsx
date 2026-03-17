import { useAuth } from "@/components/constants/authContext";
import { MyLoader } from "@/components/ui/loader";
import { Box, Text } from "@/components/ui/theme";
import { useState } from "react";
import { LayoutAnimation, ScrollView, StyleSheet } from "react-native";
import { useLearnerTrainings } from "../../components/features/learnerProfile/hooks/useLearnerTrainings";
import TrainingCollapse from "../../components/features/learnerProfile/learningColapse";
import { ms } from "../../components/ui/theme";

// ✅ setLayoutAnimationEnabledExperimental retiré — déprécié sur New Architecture
// LayoutAnimation fonctionne nativement sans cette config sur Expo SDK 54 + New Arch

export default function LearnerProgressScreen() {
  const { user } = useAuth();
  const { myTrainings, loading } = useLearnerTrainings(user?.uid);
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <MyLoader message="Chargement..." />;

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
      <ScrollView contentContainerStyle={{ padding: ms(16) }}>
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
    borderBottomLeftRadius: ms(20),
    borderBottomRightRadius: ms(20),
    elevation: ms(3),
  },
});
