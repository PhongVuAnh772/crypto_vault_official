import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import RNCustomInput from 'src/components/layout/SearchInput';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import {
    DeleteTextSvgIcon,
    SearchSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { ManageCrypto } from './manageCrypto.components';
import { useCrypto } from './manageCrypto.hook';
import useStyles from './manageCrypto.style';

const ManageCryptoScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        theme,
        searchValue,
        handleSearchChange,
        cleanSearch,
        onPressAddCustomCrypto,
        listTokenByWalletAddress,
        setLoadingImages,
        isLoadingImages,
        newUI,
        handleOnChangeStatus,
        hideAddCustomToken,
    } = useCrypto({ navigation });

    const styles = useStyles(theme);

    return (
        <ScreenWrapper
            paddingTop
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }
            enableHeader
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTitleWithI18n={LanguageKey.title_manage_crypto}>
            <View style={styles.container}>
                <View style={[appStyles.pV15, appStyles.pH25]}>
                    <RNCustomInput
                        placeholder={LanguageKey.search_crypto_title}
                        value={searchValue}
                        containerStyle={styles.input}
                        setValue={handleSearchChange}
                        keyboardType="default"
                        leftIcon={
                            <SearchSvgIcon color={theme.colors.outline} />
                        }
                        secureTextEntry={false}
                        RightIcon={
                            searchValue !== '' && (
                                <TouchableOpacity onPress={cleanSearch}>
                                    <DeleteTextSvgIcon />
                                </TouchableOpacity>
                            )
                        }
                    />
                </View>
                <View style={[appStyles.flex1, appStyles.pH25]}>
                    <ManageCrypto
                        tokenData={listTokenByWalletAddress}
                        searching={searchValue}
                        isLoadingImages={isLoadingImages}
                        setIsLoadingImage={setLoadingImages}
                        handleOnChangeStatus={handleOnChangeStatus}
                    />
                    {hideAddCustomToken ? null : (
                        <View style={[appStyles.justifyContentEnd]}>
                            {newUI ? (
                                <AppButtonSVG
                                    titleWithI18n={
                                        LanguageKey.add_custom_crypto_title
                                    }
                                    textColor={
                                        theme.colors.text_on_surface_text_brand
                                    }
                                    styles={styles.button}
                                    textVariant={TextVariantKeys.bodyMMedium}
                                    onPress={onPressAddCustomCrypto}
                                    SvgView={SvgView.button}
                                    buttonHeight={48}
                                />
                            ) : (
                                <AppButton
                                    titleWithI18n={
                                        LanguageKey.add_custom_crypto_title
                                    }
                                    textColor={
                                        theme.colors.text_on_surface_text_brand
                                    }
                                    styles={styles.button}
                                    textVariant={TextVariantKeys.bodyMMedium}
                                    onPress={onPressAddCustomCrypto}
                                />
                            )}
                        </View>
                    )}
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default ManageCryptoScreen;
