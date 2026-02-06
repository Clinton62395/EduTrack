module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // DOIT TOUJOURS ÊTRE EN DERNIÈRE POSITION
      "react-native-reanimated/plugin",
    ],
  };
};
