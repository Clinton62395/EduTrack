import { Box, Text } from "@/components/ui/theme";
import React from "react";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// On rend le composant Box "animable"
const AnimatedBox = Animated.createAnimatedComponent(Box);

export default function HomeScreen() {
  return (
    <Box flex={1} backgroundColor="background" padding="m">
      <SafeAreaView style={{ flex: 1 }}>
        {/* Titre avec animation d'entrée par la droite */}
        <Animated.View entering={FadeInRight.delay(200)}>
          <Text variant="hero" color="primary">
            EduTrack
          </Text>
        </Animated.View>

        {/* Carte de bienvenue animée par le bas */}
        <AnimatedBox
          entering={FadeInDown.springify().delay(400)}
          backgroundColor="white"
          padding="l"
          marginTop="xl"
          borderRadius="m"
          shadowColor="text"
          shadowOpacity={0.1}
          shadowOffset={{ width: 0, height: 10 }}
          shadowRadius={15}
          elevation={5} // Important pour l'ombre sur Android
        >
          <Text variant="title">Bonjour ! 👋</Text>
          <Text variant="body" color="muted" marginTop="s">
            Prêt à organiser vos cours et vos révisions ?
          </Text>
        </AnimatedBox>
      </SafeAreaView>
    </Box>
  );
}
