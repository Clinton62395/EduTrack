// app/(onboarding)/index.jsx
import { Box, Text } from "@/components/ui/theme";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { onboardingData } from "./omboadData";
import { PaginationDots } from "./omboardDote";
import { OnboardingSlide } from "./omboardSlide";

export default function OnboardingComponent() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const { width: screenWidth } = Dimensions.get("window");
  const isLast = currentIndex === onboardingData.length - 1;

  const scrollTo = () => {
    if (!isLast) {
      slidesRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.replace("/(auth)/login");
    }
  };

  const skipOnboarding = () => router.replace("/(auth)/login");

  return (
    <>
      <Box flex={1} backgroundColor="overlayDark">
        {/* Skip button — style glass */}
        <Box position="absolute" top={54} right={20} zIndex={10}>
          <TouchableOpacity onPress={skipOnboarding} style={styles.skipButton}>
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        </Box>

        {/* Carousel */}
        <FlatList
          ref={slidesRef}
          data={onboardingData}
          renderItem={({ item }) => <OnboardingSlide item={item} />}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          snapToInterval={screenWidth}
          snapToAlignment="center"
          decelerationRate="fast"
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          removeClippedSubviews={true}
          windowSize={3}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />

        {/* Bottom section — glassmorphique */}
        <Box
          position="absolute"
          bottom={44}
          left={0}
          right={0}
          paddingHorizontal="xl"
          alignItems="center"
          gap="s"
        >
          <PaginationDots data={onboardingData} currentIndex={currentIndex} />

          {/* Bouton glass */}
          <Box style={styles.buttonWrapper} width="100%">
            <Box style={styles.indicator} width="100%"></Box>
            <TouchableOpacity
              onPress={scrollTo}
              style={[styles.glassButton, isLast && styles.glassButtonPrimary]}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {isLast ? "Commencer" : "Suivant"}
              </Text>
              <ChevronRight size={18} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </Box>
        </Box>
      </Box>
    </>
  );
}

const styles = StyleSheet.create({
  skipButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  buttonWrapper: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#63B3ED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glassButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  glassButtonPrimary: {
    backgroundColor: "rgba(99, 179, 237, 0.28)",
    borderColor: "rgba(99, 179, 237, 0.5)",
  },
  buttonText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
});
