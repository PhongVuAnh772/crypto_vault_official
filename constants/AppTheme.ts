import {
  MD3Theme,
  MD3DarkTheme as PaperDarkTheme,
  MD3LightTheme as PaperLightTheme,
} from "react-native-paper";

// Shared color config (có thể tùy chỉnh)
const sharedColors = {
  primary: "#3B82F6", // blue-500
  secondary: "#FBBF24", // yellow-400
  tertiary: "#10B981", // green-500
};

// Font name bạn dùng
const fontFamily = "MPLUS1-Regular";

// Tự động override toàn bộ fontFamily trong theme
function overrideFonts(theme: MD3Theme): MD3Theme["fonts"] {
  return Object.fromEntries(
    Object.entries(theme.fonts).map(([key, value]) => [
      key,
      { ...value, fontFamily },
    ])
  ) as MD3Theme["fonts"];
}

export const AppLightTheme: MD3Theme = {
  ...PaperLightTheme,
  colors: {
    ...PaperLightTheme.colors,
    ...sharedColors,
    background: "#ffffff",
    surface: "#f5f5f5",
  },
  fonts: overrideFonts(PaperLightTheme),
};

export const AppDarkTheme: MD3Theme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    ...sharedColors,
    background: "#121212",
    surface: "#1e1e1e",
  },
  fonts: overrideFonts(PaperDarkTheme),
};
