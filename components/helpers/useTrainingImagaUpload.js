import axios from "axios";

// On ajoute 'folderPath' en paramètre pour décider où ranger le fichier
export const uploadToCloudinary = async (uri, folderPath = "Edutrack/Misc") => {
  try {
    const formData = new FormData();

    formData.append("file", {
      uri: uri,
      type: "image/jpeg",
      name: `upload-${Date.now()}.jpg`,
    });

    formData.append("upload_preset", "edutrack_unsigned");
    // On utilise le chemin passé en argument
    formData.append("folder", folderPath);

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dhpbglioz/image/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return response.data.secure_url;
  } catch (err) {
    console.error("❌ Erreur Cloudinary:", err.response?.data || err.message);
    throw new Error("Échec de l'upload");
  }
};
