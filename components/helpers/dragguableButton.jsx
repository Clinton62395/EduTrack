import { Box } from "@/components/ui/theme";
import { Plus } from "lucide-react-native";
import { useRef } from "react";
import { Animated, Dimensions, PanResponder } from "react-native";

const { width, height } = Dimensions.get("window");

export function DraggableJoinFab({ onPress }) {
  const position = useRef(
    new Animated.ValueXY({
      x: width - 90,
      y: height - 180,
    }),
  ).current;

  // Pour détecter si c'était un vrai drag ou juste un tap
  const isDragging = useRef(false);
  const dragThreshold = 5; // pixels de tolérance

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // On prend le contrôle seulement si l'utilisateur bouge vraiment
        return (
          Math.abs(gestureState.dx) > dragThreshold ||
          Math.abs(gestureState.dy) > dragThreshold
        );
      },

      onPanResponderGrant: () => {
        // ✅ Crucial : on fixe l'offset sur la position actuelle
        // pour que le move parte de là où on est
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
        position.setValue({ x: 0, y: 0 });
        isDragging.current = false;
      },

      onPanResponderMove: (_, gestureState) => {
        if (
          Math.abs(gestureState.dx) > dragThreshold ||
          Math.abs(gestureState.dy) > dragThreshold
        ) {
          isDragging.current = true;
        }
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },

      onPanResponderRelease: (_, gestureState) => {
        // On consolide offset + valeur
        position.flattenOffset();

        // Clamp pour rester dans l'écran
        const currentX = position.x._value;
        const currentY = position.y._value;
        const clampedX = Math.max(10, Math.min(currentX, width - 70));
        const clampedY = Math.max(10, Math.min(currentY, height - 70));

        if (currentX !== clampedX || currentY !== clampedY) {
          Animated.spring(position, {
            toValue: { x: clampedX, y: clampedY },
            useNativeDriver: false,
          }).start();
        }

        // ✅ On ouvre le modal seulement si c'était un vrai tap
        if (!isDragging.current) {
          onPress?.();
        }

        isDragging.current = false;
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        { position: "absolute" },
        {
          transform: position.getTranslateTransform(),
        },
      ]}
    >
      <Box
        width={60}
        height={60}
        borderRadius="rounded"
        backgroundColor="primary"
        justifyContent="center"
        alignItems="center"
        style={{
          elevation: 8,
          shadowColor: "#2563EB",
          shadowOpacity: 0.4,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Plus size={30} color="white" strokeWidth={3} />
      </Box>
    </Animated.View>
  );
}
