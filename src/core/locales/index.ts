import i18next from 'i18next';
import en from './langs/en.json';
import jp from './langs/jp.json';

i18next.init({
    compatibilityJSON: 'v3',
    interpolation: {escapeValue: false},
    lng: 'jp',
    fallbackLng: 'jp',
    resources: {
        en: {
            translation: en,
        },
        jp: {
            translation: jp,
        },
    },
});

const AppI18Next = i18next;

export default AppI18Next;
