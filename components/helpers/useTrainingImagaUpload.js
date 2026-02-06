// useTrainingImagaUpload.js (version corrigée)
import axios from "axios";

export const uploadToCloudinary = async (uri) => {
  try {
    console.log("📤 Début upload vers Cloudinary...");
    console.log("📍 URI:", uri);

    const formData = new FormData();

    // ✅ Format correct pour React Native
    formData.append("file", {
      uri: uri,
      type: "image/jpeg", // Plus spécifique que "image/*"
      name: `formation-${Date.now()}.jpg`,
    });

    formData.append("upload_preset", "edutrack_unsigned");
    formData.append("folder", "Edutrack/Formations");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dhpbglioz/image/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          console.log(`📊 Upload: ${percentCompleted}%`);
        },
      },
    );

    console.log("✅ Upload réussi:", response.data.secure_url);
    return response.data.secure_url;
  } catch (err) {
    console.error("❌ Erreur Cloudinary:", err.response?.data || err.message);
    throw new Error("Échec de l'upload de l'image");
  }
};
