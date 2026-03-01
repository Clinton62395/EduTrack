import { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput } from "react-native";

const MAX_HEIGHT = 120; // hauteur max de l'input

export const ChatTextInput = ({
  value,
  onChangeText,
  onFocus,
  onBlur,
  placeholder,
  inputRef, // ref parent
}) => {
  const internalRef = useRef(null);
  const [height, setHeight] = useState(40); // hauteur dynamique initiale

  useEffect(() => {
    if (inputRef) {
      inputRef.current = internalRef.current;
    }
  }, [inputRef]);

  return (
    <TextInput
      ref={internalRef}
      style={[styles.input, { height }]}
      value={value}
      onChangeText={onChangeText}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      multiline
      scrollEnabled={height >= MAX_HEIGHT} // scroll si dépasse MAX_HEIGHT
      textAlignVertical="top"
      onContentSizeChange={(e) => {
        const newHeight = Math.min(
          MAX_HEIGHT,
          e.nativeEvent.contentSize.height + 4,
        ); // +4 pour padding
        setHeight(newHeight);
      }}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    color: "#1E293B",
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: MAX_HEIGHT,
  },
});
