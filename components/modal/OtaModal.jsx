import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OtaModal({
  updateAvailable,
  handleUpdateNow,
  handleUpdateLater,
  isRestarting,
}) {
  return (
    <>
      <Modal
        visible={updateAvailable}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Nouvelle version disponible</Text>
            <Text style={styles.message}>
              Une nouvelle version de l&apos;application est disponible.
              Veuillez mettre à jour pour profiter des dernières
              fonctionnalités.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.laterButton]}
                onPress={handleUpdateLater}
                disabled={isRestarting}
              >
                <Text style={styles.laterButtonText}>Plus tard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={handleUpdateNow}
                disabled={isRestarting}
              >
                <Text style={styles.updateButtonText}>
                  {isRestarting ? "Mise à jour en cours..." : "Mettre à jour"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Styles pour le modal de mise à jour
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  laterButton: {
    backgroundColor: "#e5e7eb",
  },
  laterButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
  },
  updateButton: {
    backgroundColor: "#2563EB",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
