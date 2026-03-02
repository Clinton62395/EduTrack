import { LogOut } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, PanResponder, Pressable } from "react-native";
import { ConfirmModal } from "../modal/ConfirmModal";

const { width, height } = Dimensions.get("window");

export function LogoutButton({
  requireMasterCode,
  masterCode,
  onLogout,
  animationMode = "pulse", // "spin" | "bounce" | "pulse" | "standard"
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // --- POSITION : JS-driven pour PanResponder ---
  const position = useRef(
    new Animated.ValueXY({ x: width - 80, y: height - 180 }),
  ).current;

  // --- ANIM ICONE : native-driven ---
  const animValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let anim;
    if (animationMode === "spin") {
      anim = Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      );
    } else if (animationMode === "bounce") {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: -18,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );
    } else if (animationMode === "pulse") {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
    } else if (animationMode === "standard") {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: -1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      );
    }

    anim?.start();
    return () => anim?.stop();
  }, [animationMode]);

  const getAnimTransform = () => {
    if (animationMode === "spin") {
      const rotate = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
      });
      return [{ rotate }];
    }
    if (animationMode === "bounce") {
      return [{ translateY: animValue }];
    }
    if (animationMode === "pulse") {
      return [{ scale: scaleValue }];
    }
    if (animationMode === "standard") {
      const rotate = animValue.interpolate({
        inputRange: [-1, 1],
        outputRange: ["-8deg", "8deg"],
      });
      return [{ rotate }];
    }
    return [];
  };

  // --- PANRESPONDER pour drag ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        setIsDragging(true);
        position.setOffset({ x: position.x._value, y: position.y._value });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: () => {
        setIsDragging(false);
        position.flattenOffset();
        const x = Math.max(10, Math.min(position.x._value, width - 70));
        const y = Math.max(10, Math.min(position.y._value, height - 70));
        Animated.spring(position, {
          toValue: { x, y },
          useNativeDriver: false,
          bounciness: 12,
        }).start();
      },
    }),
  ).current;

  const handleLogout = async () => {
    try {
      await onLogout();
      setModalVisible(false);
    } catch (err) {
      console.error("Erreur logout:", err);
    }
  };

  return (
    <>
      {/* --- CONTAINER DRAGGABLE --- */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          position: "absolute",
          zIndex: 9999,
          elevation: 10,
          transform: position.getTranslateTransform(),
        }}
      >
        <Pressable onPress={() => !isDragging && setModalVisible(true)}>
          {/* --- ICONE ANIMEE --- */}
          <Animated.View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: isDragging ? "#DC2626" : "#EF4444",
              justifyContent: "center",
              alignItems: "center",
              elevation: 8,
              shadowColor: "#EF4444",
              shadowOpacity: 0.4,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              transform: getAnimTransform(), // Native-driven
            }}
          >
            <LogOut size={26} color="white" />
          </Animated.View>
        </Pressable>
      </Animated.View>

      <ConfirmModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleLogout}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        requiredMasterCode={requireMasterCode ? masterCode : undefined}
      />
    </>
  );
}
