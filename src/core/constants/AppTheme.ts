import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { AppThemeType } from "src/core/type/ThemeType";

export const AppLightTheme: AppThemeType = {
  ...MD3LightTheme,
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
  },
};

export const AppDarkTheme: AppThemeType = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    label_surface_button_light: "#3E3F40",
    label_surface_button_off: "#3e3f40",
    label_surface_button_pressed: "#6c6f73",
    label_surface_button_primary: "#e5382e",
    label_surface_disable: "#3e3f40",
    label_text_disable: "#6c6f73",
    outline_outine: "#3e3f40",
    outline_outine_lightest: "#3e3f40",
    outline_outine_brands: "#e1251b",
    outline_outine_brands_off: "#826867",
    outline_outine_medium: "#6c6f73",
    outline_outine_strong: "#f8f8f8",
    success_outline: "#8dface",
    success_text: "#4ca977",
    surface_surface__medium: "#3e3f40",
    surface_surface_brand: "#e5382e",
    surface_surface_brand_light: "#ffdeda",
    surface_surface_brand_lightest: "#ffdeda",
    surface_surface_nav: "#000000cc",
    surface_surface_button_container: "#00000014",
    surface_surface_default: "#171717",
    surface_surface_high: "#272727",
    text_on_surface_text_brand: "#ffffff",
    text_on_surface_text_brand_2: "#e5382e",
    text_on_surface_text_high: "#f8f8f8",
    text_on_surface_text_highest: "#ffffff",
    text_on_surface_text_invert: "#ffffff",
    text_on_surface_text_light: "#a6a9b0",
    text_on_surface_text_lightest: "#6c6f73",
    text_on_surface_text_medium: "#c8c8c8",
    text_on_surface_text_medium_high: "#f0f0f0",
    warning_container: "#ffb6251a",
    warning_outline: "#ffe58f",
    warning_text: "#ffb625",
    surface_surface_nav_2: "#f9d5d3",
  },
};
