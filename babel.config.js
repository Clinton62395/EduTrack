module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
          },
        },
      ],

      // DOIT TOUJOURS ÊTRE EN DERNIÈRE POSITION
      "react-native-reanimated/plugin",
    ],
  };
};
