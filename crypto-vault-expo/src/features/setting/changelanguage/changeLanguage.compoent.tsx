import React from 'react';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';
import {FlatList, TouchableOpacity, View} from 'react-native';
import AppRadio from 'src/components/common/AppRadio';
import {useAppTheme} from 'src/core/hooks/useAppTheme';
import useStyles from './changeLanguage.style';
import LanguageType from 'src/core/enum/LanguageType';
import {ListLanguageType, TypeLanguage} from './changeLanguage.type';

const Separator = () => {
    const theme = useAppTheme();
    const settingStyle = useStyles(theme);
    return <View style={settingStyle.separator} />;
};

const ViewListLanguage: React.FC<ListLanguageType> = ({
    languageActive,
    listLanguage,
    theme,
    style,
    onChangeLanguage,
}) => {
    const checkBoxActive = (language: LanguageType) => {
        if (languageActive === language) {
            return true;
        } else {
            return false;
        }
    };
    const renderItem = ({item, index}: {item: TypeLanguage; index: number}) => {
        return (
            <TouchableOpacity
                key={index}
                onPress={() => onChangeLanguage(item.key)}
                style={[appStyles.flexRow, style, appStyles.alignItemsCenter]}>
                <AppRadio checked={checkBoxActive(item.key)} />
                <View style={appStyles.ml10}>
                    <AppText
                        title={item.language}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_high}
                        maxFontSizeMultiplier={1.2}
                    />
                </View>
            </TouchableOpacity>
        );
    };
    return (
        <FlatList
            data={listLanguage}
            keyExtractor={item => item.language}
            ItemSeparatorComponent={Separator}
            renderItem={renderItem}
        />
    );
};
export {ViewListLanguage};
