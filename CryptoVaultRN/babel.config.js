module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          src: './src',
          'env.config': './env.config',
          components: './components',
          constants: './constants',
          type: './type',
          modules: './modules',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
