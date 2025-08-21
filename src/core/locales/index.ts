import i18next from "i18next";
import { initReactI18next } from "react-i18next"; // BẮT BUỘC cho <I18nextProvider>
import en from "./langs/en.json";
import vi from "./langs/vi.json";

// ⚠️ Bạn PHẢI dùng initReactI18next:
i18next.use(initReactI18next).init({
  compatibilityJSON: "v4",
  interpolation: { escapeValue: false },
  lng: "jp",
  fallbackLng: "jp",
  resources: {
    en: { translation: en },
    jp: { translation: vi },
  },
});

export default i18next; // ✅ phải là default export
