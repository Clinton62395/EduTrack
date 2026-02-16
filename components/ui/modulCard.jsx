import { Box, Text } from "@/components/ui/theme";
import { Edit, MoreVertical, Trash2 } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";

function ModuleCard({ module, index, onEdit, onDelete, isLearner }) {
  const [showMenu, setShowMenu] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    if (showMenu) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      translateAnim.setValue(-10);
    }
  }, [showMenu]);

  return (
    <>
      {/* Card */}
      <TouchableOpacity activeOpacity={0.9}>
        <Box
          padding="m"
          backgroundColor="cardBackground"
          borderRadius="l"
          flexDirection="row"
          alignItems="center"
          gap="m"
          marginBottom="m"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          {/* Numéro */}
          <Box
            backgroundColor="primary"
            width={38}
            height={38}
            borderRadius="rounded"
            justifyContent="center"
            alignItems="center"
          >
            <Text variant="body" color="white" fontWeight="bold">
              {index + 1}
            </Text>
          </Box>

          {/* Titre */}
          <Text variant="subtitle" flex={1}>
            {module.title}
          </Text>

          {/* Bouton menu */}
          <TouchableOpacity onPress={() => setShowMenu(true)} hitSlop={15}>
            <MoreVertical size={20} color="#64748B" />
          </TouchableOpacity>
        </Box>
      </TouchableOpacity>

      {/* PREMIUM MODAL MENU */}
      <Modal
        transparent
        visible={showMenu}
        animationType="none"
        onRequestClose={() => setShowMenu(false)}
      >
        {/* Overlay */}
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.25)",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
          onPress={() => setShowMenu(false)}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }],
            }}
          >
            {!isLearner && (
              <Box
                backgroundColor="white"
                borderRadius="l"
                padding="xs"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                {/* Modifier */}
                <TouchableOpacity
                  onPress={() => {
                    setShowMenu(false);
                    onEdit(module);
                  }}
                >
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    gap="m"
                    paddingVertical="m"
                    paddingHorizontal="m"
                  >
                    <Edit size={20} color="#2563EB" />
                    <Text variant="action">Modifier le module</Text>
                  </Box>
                </TouchableOpacity>

                <Box height={1} backgroundColor="border" />

                {/* Supprimer */}
                <TouchableOpacity
                  onPress={() => {
                    setShowMenu(false);
                    onDelete(module.id);
                  }}
                >
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    gap="m"
                    paddingVertical="m"
                    paddingHorizontal="m"
                  >
                    <Trash2 size={20} color="#DC2626" />
                    <Text color="danger" fontWeight="600">
                      Supprimer définitivement
                    </Text>
                  </Box>
                </TouchableOpacity>
              </Box>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

export default ModuleCard;
