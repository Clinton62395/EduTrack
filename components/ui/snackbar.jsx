import { Snackbar } from "react-native-paper";

export function Snack({
  visible,
  onDismiss,
  duration = 4000,
  style,
  children,
}) {
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      style={{
        alignSelf: "center",
        backgroundColor: "red",
        borderRadius: 8,
        width: '100%',
        ...style, // permet de surcharger le style si besoin
      }}
    >
      {children}
    </Snackbar>
  );
}
