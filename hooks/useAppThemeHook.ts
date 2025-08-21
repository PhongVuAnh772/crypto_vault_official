import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { useFonts } from "expo-font";
import { StatusBarStyle, useColorScheme } from "react-native";
import { MD3Theme } from "react-native-paper";
import { AppDarkTheme, AppLightTheme } from "../constants/AppTheme";

export type UseAppThemeReturn = {
  paperTheme: MD3Theme;
  barStyle: StatusBarStyle;
  isDarkMode: boolean;
  fontsLoaded: boolean;
  fonts: MD3Theme["fonts"];
};

const useAppTheme = (): UseAppThemeReturn => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [fontsLoaded] = useFonts({
    ManropeRegular: Manrope_400Regular,
    ManropeMedium: Manrope_500Medium,
    ManropeBold: Manrope_700Bold,
    ManropeExtraBold: Manrope_800ExtraBold,
  });

  const paperTheme = isDarkMode ? AppDarkTheme : AppLightTheme;

  const barStyle: StatusBarStyle = isDarkMode
    ? "light-content"
    : "dark-content";
  const fonts: MD3Theme["fonts"] = {
    ...paperTheme.fonts,
    bodyMedium: {
      ...paperTheme.fonts.bodyMedium,
      fontFamily: "ManropeExtraBold",
    },
    titleMedium: {
      ...paperTheme.fonts.titleMedium,
      fontFamily: "ManropeMedium",
    },
    labelLarge: {
      ...paperTheme.fonts.labelLarge,
      fontFamily: "ManropeBold",
    },
    headlineSmall: {
      ...paperTheme.fonts.headlineSmall,
      fontFamily: "ManropeExtraBold",
    },
  };

  return {
    paperTheme,
    barStyle,
    isDarkMode,
    fontsLoaded,
    fonts,
  };
};

export default useAppTheme;
