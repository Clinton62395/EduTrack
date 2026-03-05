import { ProfileSection } from "@/components/common/profileSection";
import { Box, Text } from "@/components/ui/theme";
import { Image } from "expo-image";
import { Check, ImageIcon, Pencil } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  Text as RNText,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

const CERTIFICATE_COLORS = [
  { label: "Bleu", value: "#2563EB" },
  { label: "Indigo", value: "#4F46E5" },
  { label: "Violet", value: "#7C3AED" },
  { label: "Rose", value: "#DB2777" },
  { label: "Rouge", value: "#DC2626" },
  { label: "Orange", value: "#EA580C" },
  { label: "Vert", value: "#16A34A" },
  { label: "Teal", value: "#0D9488" },
  { label: "Gris ardoise", value: "#475569" },
  { label: "Noir", value: "#1E293B" },
];

// Composant pour uploader le logo
function LogoUploader({ logo, uploading, uploadProgress, onPress }) {
  return (
    <Box paddingHorizontal="m" marginBottom="m">
      <Text variant="body" color="muted" marginBottom="s">
        Logo de l&apos;organisation (optionnel)
      </Text>
      <Text variant="small" color="muted" italic marginBottom="s">
        Ce logo apparaîtra sur les certificats de vos apprenants. Idéalement au
        format PNG avec un fond transparent.
      </Text>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.uploadArea,
          pressed && { opacity: 0.75 },
        ]}
      >
        {uploading ? (
          <Box alignItems="center" gap="xs">
            <ActivityIndicator color="#2563EB" />
            <Text variant="small" color="primary">
              Upload... {uploadProgress}%
            </Text>
          </Box>
        ) : logo ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: logo }}
              style={styles.logoImage}
              contentFit="contain"
            />
            <View style={styles.overlay}>
              <Pencil size={16} color="white" />
              <RNText style={styles.overlayText}>Modifier</RNText>
            </View>
          </View>
        ) : (
          <Box alignItems="center" gap="xs">
            <ImageIcon size={30} color="#9CA3AF" />
            <Text variant="small" color="muted">
              Cliquez pour uploader un logo
            </Text>
          </Box>
        )}
      </Pressable>
    </Box>
  );
}

// Composant pour choisir la couleur du certificat
function ColorPicker({ selected, onSelect }) {
  return (
    <Box paddingHorizontal="m" marginBottom="m">
      <Text variant="body" color="muted" marginBottom="s">
        Couleur du certificat
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Box flexDirection="row" gap="s">
          {CERTIFICATE_COLORS.map((color) => {
            const isSelected = selected === color.value;
            return (
              <Pressable
                key={color.value}
                onPress={() => onSelect(color.value)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color.value },
                  isSelected && styles.colorSwatchSelected,
                ]}
              >
                {isSelected && (
                  <Check size={16} color="white" strokeWidth={3} />
                )}
              </Pressable>
            );
          })}
        </Box>
      </ScrollView>
      <Box flexDirection="row" alignItems="center" gap="s" marginTop="s">
        <View
          style={[
            styles.colorPreview,
            { backgroundColor: selected || "#2563EB" },
          ]}
        />
        <RNText style={styles.colorLabel}>
          {CERTIFICATE_COLORS.find((c) => c.value === selected)?.label ||
            "Bleu"}
        </RNText>
      </Box>
    </Box>
  );
}

// Composant principal
export function VisualIdentitySection({
  user,
  logoUploading,
  uploadProgress,
  uploadType,
  onLogoUpload,
  onUpdate,
}) {
  return (
    <Box
      marginHorizontal="m"
      marginTop="m"
      backgroundColor="white"
      borderRadius="l"
      paddingBottom="m"
    >
      <ProfileSection title="Identité Visuelle (Certificats)">
        <LogoUploader
          logo={user?.certificateLogo}
          uploading={uploadType === "certificateLogo" && logoUploading}
          uploadProgress={uploadProgress}
          onPress={() => onLogoUpload("certificateLogo")}
        />
        <ColorPicker
          selected={user?.certificateColor || "#2563EB"}
          onSelect={(v) => onUpdate("certificateColor", v)}
        />
      </ProfileSection>
    </Box>
  );
}

const styles = StyleSheet.create({
  uploadArea: {
    height: 110,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 34,
    backgroundColor: "rgba(0,0,0,0.45)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  overlayText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchSelected: {
    borderColor: "#1E293B",
    transform: [{ scale: 1.15 }],
  },
  colorPreview: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  colorLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
});
