import axios from "axios";
import { useState } from "react";

export const useChatFilesUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (
    uri,
    type = "image",
    folderPath = "Edutrack/Chat",
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();

      // Détection dynamique du type MIME
      const fileExtension = uri.split(".").pop();
      const fileName = `chat_${Date.now()}.${fileExtension}`;

      formData.append("file", {
        uri: uri,
        type: type === "image" ? "image/jpeg" : "application/pdf",
        name: fileName,
      });

      formData.append("upload_preset", "edutrack_unsigned");
      formData.append("folder", folderPath);
      // 'auto' permet à Cloudinary de gérer images ET documents (PDF, etc.)
      formData.append("resource_type", "auto");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dhpbglioz/upload", // URL simplifiée (sans /image/)
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return response.data.secure_url;
    } catch (err) {
      console.error("❌ Erreur Cloudinary:", err.response?.data || err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
};
