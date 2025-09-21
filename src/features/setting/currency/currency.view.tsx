import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppText from 'src/components/common/AppText';
import RNCustomInput from 'src/components/layout/SearchInput';
import SearchEmpty from 'src/components/specific/SearchEmpty';
import appColors from 'src/core/constants/AppColors';
import { CheckSvgIcon, SearchSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import { SettingCurrencyType } from 'src/core/redux/slice/type';
import appStyles from 'src/core/styles';
import useCurrency from './currency.hook';

const CurrencyScreen = () => {
    const {
        theme,
        styles,
        searchData,
        onSelectItem,
        selectedCurrencySetting,
        searchValue,
        onChangeSearchValue,
        isEmptyData,
        newUI,
    } = useCurrency();
    const renderItem = ({ item }: { item: SettingCurrencyType }) => {
        const isSelected = item.name === selectedCurrencySetting.name;
        return (
            <TouchableOpacity
                onPress={() => onSelectItem(item)}
                style={[
                    appStyles.flexRow,
                    appStyles.pV10,
                    appStyles.justifyContentBetween,
                ]}>
                <AppText
                    title={item.name}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={theme.colors.text_on_surface_text_high}
                />
                <View style={appStyles.flexRow}>
                    <AppText
                        title={item.symbol}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_light}
                    />
                    {isSelected && (
                        <View style={[appStyles.center, appStyles.ml10]}>
                            <CheckSvgIcon
                                color={theme.colors.surface_surface_brand}
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };
    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }
            headerTitleWithI18n={LanguageKey.currency_settings_title}>
            <View style={styles.container}>
                <View style={[appStyles.mv10]}>
                    <RNCustomInput
                        placeholder={LanguageKey.search_currency_title}
                        keyboardType="default"
                        leftIcon={
                            <SearchSvgIcon
                                color={theme.colors.text_on_surface_text_high}
                            />
                        }
                        secureTextEntry={false}
                        containerStyle={styles.input}
                        value={searchValue}
                        setValue={onChangeSearchValue}
                    />
                </View>
                {isEmptyData ? (
                    <SearchEmpty styles={appStyles.mt60} />
                ) : (
                    <FlatList
                        contentContainerStyle={appStyles.pB150}
                        data={searchData}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default CurrencyScreen;
