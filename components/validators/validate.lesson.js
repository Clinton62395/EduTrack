import { BookOpen, FileText, Play } from "lucide-react-native";
import * as yup from "yup";

// ─────────────────────────────────────────
// 📋 SCHÉMA DE VALIDATION
// ─────────────────────────────────────────
export const lessonSchema = yup.object({
  title: yup.string().required("Le titre est requis"),
  type: yup
    .string()
    .oneOf(["text", "video", "pdf", "quiz"])
    .required("Le type est requis"),
  content: yup.string().required("Le contenu est requis"),
  duration: yup
    .number()
    .nullable()
    .transform((v) => (isNaN(v) ? null : v)),
});

// ─────────────────────────────────────────
// 🎨 TYPES DE LEÇONS DISPONIBLES
// ─────────────────────────────────────────
export const LESSON_TYPES = [
  {
    value: "text",
    label: "Texte",
    icon: <BookOpen size={18} color="#2563EB" />,
    placeholder: "Écrivez le contenu de la leçon...",
  },
  {
    value: "video",
    label: "Vidéo",
    icon: <Play size={18} color="#EF4444" />,
    placeholder: "URL de la vidéo (YouTube, Loom...)",
  },
  {
    value: "pdf",
    label: "PDF",
    icon: <FileText size={18} color="#F59E0B" />,
    placeholder: "URL du fichier PDF",
  },
];
