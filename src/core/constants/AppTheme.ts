import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { AppThemeType } from "src/core/type/ThemeType";
import fontsConfigure from "./FontConfig";

export const AppLightTheme: AppThemeType = {
  ...MD3LightTheme,
  fonts: fontsConfigure,
  colors: {
    ...MD3LightTheme.colors, // sử dụng base light theme
    // BUTTONS
    label_surface_button_light: "#e6f0ff", // xanh nhạt
    label_surface_button_off: "#cce0ff", // xanh nhạt hơn
    label_surface_button_pressed: "#0052cc", // xanh dương đậm khi nhấn
    label_surface_button_primary: "#0066ff", // màu nút chính
    label_surface_disable: "#d9d9d9", // disable button
    label_text_disable: "#888888", // text disable

    // OUTLINES
    outline_outine: "#cce0ff",
    outline_outine_lightest: "#f0f5ff",
    outline_outine_brands: "#0066ff",
    outline_outine_brands_off: "#99c2ff",
    outline_outine_medium: "#99c2ff",
    outline_outine_strong: "#003366",

    // SUCCESS
    success_container: "#e6fff2",
    success_outline: "#4cd964",
    success_text: "#2ebd63",

    // SURFACES
    surface_surface__medium: "#f2f6ff",
    surface_surface_brand: "#0066ff",
    surface_surface_brand_light: "#cce0ff",
    surface_surface_brand_lightest: "#f0f5ff",
    surface_surface_nav: "#ffffffcc",
    surface_surface_nav_2: "#e6f0ff",
    surface_surface_button_container: "#ffffff14",
    surface_surface_default: "#ffffff",
    surface_surface_high: "#ffffff",

    // TEXTS
    text_on_surface_text_brand: "#ffffff",
    text_on_surface_text_brand_2: "#0066ff",
    text_on_surface_text_high: "#003366",
    text_on_surface_text_highest: "#000000",
    text_on_surface_text_invert: "#ffffff",
    text_on_surface_text_light: "#a6b0c0",
    text_on_surface_text_lightest: "#c8d0e0",
    text_on_surface_text_medium: "#6c7a8a",
    text_on_surface_text_medium_high: "#3e4b5c",

    // WARNING
    warning_container: "#fff8e6",
    warning_outline: "#ffd591",
    warning_text: "#ffa940",
    surface_surface_upcoming: "#fff0f0", // mock value for safety
  },
};

export const AppDarkTheme: AppThemeType = {
  ...MD3DarkTheme,
  fonts: fontsConfigure,
  colors: {
    ...MD3LightTheme.colors, // sử dụng base light theme
    // BUTTONS
    label_surface_button_light: "#e6f0ff", // xanh nhạt
    label_surface_button_off: "#cce0ff", // xanh nhạt hơn
    label_surface_button_pressed: "#0052cc", // xanh dương đậm khi nhấn
    label_surface_button_primary: "#0066ff", // màu nút chính
    label_surface_disable: "#d9d9d9", // disable button
    label_text_disable: "#888888", // text disable

    // OUTLINES
    outline_outine: "#cce0ff",
    outline_outine_lightest: "#f0f5ff",
    outline_outine_brands: "#0066ff",
    outline_outine_brands_off: "#99c2ff",
    outline_outine_medium: "#99c2ff",
    outline_outine_strong: "#003366",

    // SUCCESS
    success_container: "#e6fff2",
    success_outline: "#4cd964",
    success_text: "#2ebd63",

    // SURFACES
    surface_surface__medium: "#f2f6ff",
    surface_surface_brand: "#0066ff",
    surface_surface_brand_light: "#cce0ff",
    surface_surface_brand_lightest: "#f0f5ff",
    surface_surface_nav: "#ffffffcc",
    surface_surface_nav_2: "#e6f0ff",
    surface_surface_button_container: "#ffffff14",
    surface_surface_default: "#ffffff",
    surface_surface_high: "#ffffff",

    // TEXTS
    text_on_surface_text_brand: "#ffffff",
    text_on_surface_text_brand_2: "#0066ff",
    text_on_surface_text_high: "#003366",
    text_on_surface_text_highest: "#000000",
    text_on_surface_text_invert: "#ffffff",
    text_on_surface_text_light: "#a6b0c0",
    text_on_surface_text_lightest: "#c8d0e0",
    text_on_surface_text_medium: "#6c7a8a",
    text_on_surface_text_medium_high: "#3e4b5c",

    // WARNING
    warning_container: "#fff8e6",
    warning_outline: "#ffd591",
    warning_text: "#ffa940",
    surface_surface_upcoming: "#fff0f0", // mock value for safety
  },
};
