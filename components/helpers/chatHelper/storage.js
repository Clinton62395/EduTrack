import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "chat-storage" });

export const chatStorage = {
  set: (key, value) => storage.set(key, value),
  getString: (key) => storage.getString(key),
  remove: (key) => storage.remove(key),
};
