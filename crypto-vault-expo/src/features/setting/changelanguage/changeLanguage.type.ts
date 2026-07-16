import LanguageType from 'src/core/enum/LanguageType';
import {AppThemeType} from 'src/core/type/ThemeType';
import {StyleProp, ViewStyle} from 'react-native';

export type TypeLanguage = {
    language: string;
    key: LanguageType;
};
export type ListLanguageType = {
    listLanguage: TypeLanguage[];
    languageActive: LanguageType;
    theme: AppThemeType;
    style: StyleProp<ViewStyle>;
    onChangeLanguage: (key: LanguageType) => void;
};
