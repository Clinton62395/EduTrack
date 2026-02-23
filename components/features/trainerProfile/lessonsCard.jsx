import { Box, Text } from "@/components/ui/theme";
import {
  BookOpen,
  Clock,
  Edit2,
  FileText,
  Play,
  Trash2,
} from "lucide-react-native";
import { TouchableOpacity } from "react-native";

// ─────────────────────────────────────────
// 🎨 ICÔNE SELON LE TYPE DE LEÇON
// ─────────────────────────────────────────
const LESSON_ICONS = {
  text: <BookOpen size={18} color="primary" />,
  video: <Play size={18} color="danger" />,
  pdf: <FileText size={18} color="warning" />,
  quiz: <BookOpen size={18} color="success" />,
};

const LESSON_COLORS = {
  text: "infoBackground",
  video: "#secondayBackground",
  pdf: "warningBackground",
  quiz: "successLight",
};

/**
 * Carte d'affichage d'une leçon dans la liste du module.
 *
 * @param {Object} lesson - Données de la leçon
 * @param {number} index - Position dans la liste (pour affichage)
 * @param {function} onEdit - Callback d'édition
 * @param {function} onDelete - Callback de suppression
 * @param {function} onPress - Callback au clic sur la carte (navigation)
 */
export function LessonCard({ lesson, index, onEdit, onDelete, onPress }) {
  const icon = LESSON_ICONS[lesson.type] || LESSON_ICONS.text;
  const bgColor = LESSON_COLORS[lesson.type] || LESSON_COLORS.text;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Box
        backgroundColor="white"
        borderRadius="l"
        padding="m"
        marginBottom="s"
        flexDirection="row"
        alignItems="center"
        style={{
          elevation: 1,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 6,
        }}
      >
        {/* ── Numéro + icône type ── */}
        <Box
          width={40}
          height={40}
          borderRadius="m"
          backgroundColor={bgColor}
          justifyContent="center"
          alignItems="center"
          marginRight="m"
        >
          {icon}
        </Box>

        {/* ── Infos leçon ── */}
        <Box flex={1}>
          <Text variant="body" fontWeight="bold" numberOfLines={1}>
            {index + 1}. {lesson.title}
          </Text>
          <Box flexDirection="row" alignItems="center" marginTop="xs" gap="m">
            {/* Type */}
            <Text variant="caption" color="muted">
              {lesson.type?.toUpperCase() ?? "TEXTE"}
            </Text>

            {/* Durée si disponible */}
            {lesson.duration && (
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Clock size={12} color="#6B7280" />
                <Text variant="caption" color="muted">
                  {lesson.duration} min
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Actions ── */}
        <Box flexDirection="row" gap="m" alignItems="center">
          <TouchableOpacity onPress={onEdit} hitSlop={10}>
            <Edit2 size={18} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} hitSlop={10}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}
