import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Remplace MMKV — même interface pour useChatMessage.js
export const chatStorage = {
  set: async (key, value) => await AsyncStorage.setItem(key, value),
  getString: async (key) => await AsyncStorage.getItem(key),
  remove: async (key) => await AsyncStorage.removeItem(key),
};
