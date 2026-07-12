import i18next from 'i18next';
import en from './langs/en.json';
import jp from './langs/jp.json';
import vi from './langs/vi.json';

i18next.init({
    compatibilityJSON: 'v3',
    interpolation: {escapeValue: false},
    lng: 'vi',
    fallbackLng: 'vi',
    resources: {
        en: {
            translation: en,
        },
        jp: {
            translation: jp,
        },
        vi: {
            translation: vi,
        },
    },
});

const AppI18Next = i18next;

export default AppI18Next;
