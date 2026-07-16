import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';
import { ScreenWrapper } from 'src/components';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import RNCustomInput from 'src/components/layout/SearchInput';
import appColors from 'src/core/constants/AppColors';
import {
    LanguageSvgIcon,
    Remove2SvgIcon,
    RemoveSvgIcon,
    SearchSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import TonConnectUtils from 'src/core/services/TonConnect/TonConnectUntil';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useStyles from './browse.style';
import { useBrowse } from './useBrowse';

const BrowseScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        t,
        theme,
        url,
        searchValue,
        listDAppBrowse,
        isShowModalRemove,
        handleSearchChange,
        showModalRemove,
        closeModalRemove,
        removeDappBrowse,
        goToWeb,
        goToWebDapp,
    } = useBrowse({
        navigation: navigation,
    });
    const styles = useStyles(theme);

    return (
        <ScreenWrapper
            paddingTop
            headerTextColor={appColors.neutral.white}
            backButtonColor={appColors.neutral.white}
            backgroundColor={appColors.main.tokyoRed}
            enableHeader
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTitleWithI18n={LanguageKey.common_text_browse}>
            <View style={styles.container}>
                <RNCustomInput
                    placeholder={LanguageKey.search_or_enter_address_title}
                    value={searchValue}
                    containerStyle={styles.input}
                    setValue={handleSearchChange}
                    keyboardType="default"
                    leftIcon={<SearchSvgIcon color={theme.colors.outline} />}
                    secureTextEntry={false}
                    handleEnterPress={goToWeb}
                />
                <FlatList
                    style={appStyles.pV10}
                    data={listDAppBrowse}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.containerItem}
                            onPress={() => {
                                goToWebDapp(item);
                            }}>
                            <WebView
                                source={{ uri: item }}
                                scalesPageToFit={true}
                                javaScriptEnabled={true}
                                automaticallyAdjustContentInsets={false}
                                pointerEvents="none"
                            />
                            <View
                                style={[StyleSheet.absoluteFillObject]}
                                pointerEvents="auto"
                            />
                            <View style={styles.footerItem}>
                                <View style={[appStyles.flexRow]}>
                                    <LanguageSvgIcon
                                        color={
                                            theme.colors
                                                .text_on_surface_text_medium
                                        }
                                    />
                                    <AppText
                                        title={TonConnectUtils.getDomainUrl(
                                            item,
                                        )}
                                        variant={TextVariantKeys.bodyRSmall}
                                        textColor={
                                            theme.colors
                                                .text_on_surface_text_medium
                                        }
                                        styles={[appStyles.ml5]}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        showModalRemove(item);
                                    }}>
                                    <RemoveSvgIcon />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )}
                />
                <AppModal
                    twoOptions
                    visible={isShowModalRemove}
                    onPress={removeDappBrowse}
                    onPress2={closeModalRemove}
                    titleWithI18n={t(
                        LanguageKey.common_text_remove_connection_Dapp,
                        {
                            name_dapp: TonConnectUtils.getDomainUrl(url),
                        },
                    )}
                    subTitleWithI18n={LanguageKey.common_text_sure_remove_Dapp}
                    buttonTitleWithI18n={LanguageKey.common_text_confirm}
                    buttonTitleWithI18n2={LanguageKey.cancel}
                    textButtonSecondColor={
                        theme.colors.text_on_surface_text_brand_2
                    }
                    icon={<Remove2SvgIcon />}
                />
            </View>
        </ScreenWrapper>
    );
};

export default BrowseScreen;
