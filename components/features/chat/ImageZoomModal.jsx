import { Image } from "expo-image";
import { X } from "lucide-react-native";
import {
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

/**
 * ImageZoomModal
 * Affiche une image en plein écran avec possibilité de fermer
 */
export const ImageZoomModal = ({ visible, imageUri, onClose }) => {
  if (!imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Bouton fermer */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Image en zoom */}
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="contain"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width * 0.95,
    height: height * 0.85,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
});
