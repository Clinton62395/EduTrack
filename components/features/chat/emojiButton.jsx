// EmojiButton.js
import { Smile } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

export function EmojiButton({ onPress, active }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 38,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Smile size={22} color={active ? "#3B82F6" : "#64748B"} />
    </TouchableOpacity>
  );
}
