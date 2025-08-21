import { MD3Theme } from "react-native-paper";
import {
  MD3Colors,
  MD3Type,
  MD3Typescale,
} from "react-native-paper/lib/typescript/types";

interface AppMD3Colors extends MD3Colors {
  label_surface_button_light: string;
  label_surface_button_off: string;
  label_surface_button_pressed: string;
  label_surface_button_primary: string;
  label_surface_disable: string;
  label_text_disable: string;
  outline_outine: string;
  outline_outine_lightest: string;
  outline_outine_brands: string;
  outline_outine_brands_off: string;
  outline_outine_medium: string;
  outline_outine_strong: string;
  success_container: string;
  success_outline: string;
  success_text: string;
  surface_surface__medium: string;
  surface_surface_brand: string;
  surface_surface_brand_light: string;
  surface_surface_brand_lightest: string;
  surface_surface_nav: string;
  surface_surface_nav_2: string;
  surface_surface_button_container: string;
  surface_surface_default: string;
  surface_surface_high: string;
  text_on_surface_text_brand: string;
  text_on_surface_text_brand_2: string;
  text_on_surface_text_high: string;
  text_on_surface_text_highest: string;
  text_on_surface_text_invert: string;
  text_on_surface_text_light: string;
  text_on_surface_text_lightest: string;
  text_on_surface_text_medium: string;
  text_on_surface_text_medium_high: string;
  warning_container: string;
  warning_outline: string;
  warning_text: string;
  surface_surface_upcoming: string;
}
interface AppMD3Typescale extends MD3Typescale {
  headlineExtraLarge: MD3Type;
  headlineLarge: MD3Type;
  headlineMedium: MD3Type;
  headlineSmall: MD3Type;
  titleLarge: MD3Type;
  titleMedium: MD3Type;
  titleSmall: MD3Type;
  bodyMLarge: MD3Type;
  bodyMMedium: MD3Type;
  bodyMSmall: MD3Type;
  bodyMTiny: MD3Type;
  bodyRLarge: MD3Type;
  bodyRMedium: MD3Type;
  bodyRSmall: MD3Type;
  bodyRTiny: MD3Type;
  labelLarge: MD3Type;
  labelMedium: MD3Type;
  labelSmall: MD3Type;
  labelTiny: MD3Type;
  labelLink: MD3Type;
}
export interface AppThemeType extends MD3Theme {
  colors: AppMD3Colors;
  fonts: AppMD3Typescale;
}
