// app/(onboarding)/index.jsx
import { Box, Button } from "@/components/ui/theme";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useRef, useState } from "react";
import { Animated, Dimensions, FlatList } from "react-native";
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

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Fin de l'onboarding, aller à l'authentification
      router.replace("/(auth)/login");
    }
  };

  const skipOnboarding = () => {
    router.replace("/(auth)/login");
  };

  const { width: screenWidth } = Dimensions.get("window");
  return (
    <Box flex={1} backgroundColor="overlayDark">
      {/* Skip button */}
      <Box
        position="absolute"
        top={50}
        right={20}
        zIndex={10}
      >
        <Button
          title="Skip"
          variant="secondary"
          onPress={skipOnboarding}
          paddingHorizontal="m"
          paddingVertical="s"
        />
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
        // IMPORTANT : Pour que la pagination fonctionne correctement, il faut définir la taille de l'élément et son position dans le scrollview
        getItemLayout={(data, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />

      {/* Bottom section */}
      <Box
        position="absolute"
        bottom={50}
        left={0}
        right={0}
        paddingHorizontal="xl"
        alignItems="center"
      >
        {/* Pagination dots */}
        <PaginationDots data={onboardingData} currentIndex={currentIndex} />

        {/* Next/Skip button */}
        <Box marginTop="xl" width="100%">
          {currentIndex === onboardingData.length - 1 ? (
            <Button
              title="Commencer"
              onPress={skipOnboarding}
              icon={<ChevronRight size={20} color="white" />}
              iconPosition="right"
            />
          ) : (
            <Button
              title="Suivant"
              onPress={scrollTo}
              icon={<ChevronRight size={20} color="white" />}
              iconPosition="right"
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
