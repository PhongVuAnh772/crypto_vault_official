import { t } from 'i18next';
import React from 'react';
import { ScrollView, View } from 'react-native';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { SendDownSvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';
import {
    NFTTonRootData,
    NFTTonType,
} from 'src/core/redux/slice/NFT/NFTImport.type';
import { SettingCurrencyType } from 'src/core/redux/slice/type';
import appStyles from 'src/core/styles';
import commonUtils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import NFTInformation from '../NFTInformation';
import useStyles from './styles';

type ModalConfirmType = {
    fromAddress: string;
    toAddress: string;
    networkFee: number;
    adminFee: number;
    subNetworkFee?: string;
    subAdminFee?: string;
    root: NFTTonRootData;
    detail: NFTTonType;
    lastPreview: string | undefined;
    sign: string;
    isLoadingPage: boolean;
    confirmAction: () => void;
    protocolSelected: ProtocolDataWithSupportedTokensFormBEType | undefined;
    totalAmount: number;
    selectedCurrencySetting?: SettingCurrencyType;
};

const ConfirmTonView: React.FC<ModalConfirmType> = props => {
    const {
        fromAddress,
        toAddress,
        networkFee,
        subNetworkFee,
        adminFee,
        subAdminFee,
        root,
        detail,
        lastPreview,
        sign,
        isLoadingPage,
        confirmAction,
        protocolSelected,
        totalAmount,
        selectedCurrencySetting,
    } = props;

    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const styles = useStyles(theme, insets);
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    return (
        <>
            <ScrollView style={styles.container}>
                <View>
                    <View style={[styles.viewNFTInformation]}>
                        <NFTInformation
                            networkImage={root.protocol.logo ?? ''}
                            networkName={root.protocol.name}
                            nftId={detail.nftDetailAll.index ?? 0}
                            nftImage={lastPreview ?? appImages.NFTDefault}
                            nftName={
                                detail.nftDetailAll.metadata?.name ??
                                t(LanguageKey.common_unnamed_nft)
                            }
                            quantity={detail.quantity?.toString() || ''}
                        />
                    </View>
                    <View style={[styles.viewFrom, appStyles.mt15]}>
                        <View style={[styles.viewFromAddress]}>
                            <View style={styles.fromText}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_from}
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors
                                            .text_on_surface_text_lightest
                                    }
                                />
                            </View>
                            <AppText
                                title={fromAddress}
                                variant={TextVariantKeys.titleSmall}
                            />
                        </View>
                    </View>
                    <View style={[appStyles.center, appStyles.pd10]}>
                        <SendDownSvgIcon />
                    </View>

                    <View style={styles.viewTo}>
                        <View style={styles.viewFromAddress}>
                            <View style={styles.fromText}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_to}
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors
                                            .text_on_surface_text_lightest
                                    }
                                />
                            </View>
                            <AppText
                                title={toAddress}
                                variant={TextVariantKeys.titleSmall}
                            />
                        </View>
                    </View>
                    <View style={[styles.networkFee, styles.mtFee]}>
                        <AppText
                            titleWithI18n={LanguageKey.send_service_fee_title}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={theme.colors.text_on_surface_text_light}
                        />
                        <View style={appStyles.alignItemsEnd}>
                            <AppText
                                title={`${commonUtils.formattedBalanceCurrency(adminFee)} ${protocolSelected?.name}`}
                                variant={TextVariantKeys.bodyMMedium}
                            />
                            {subAdminFee ? (
                                <AppText
                                    title={`~ ${sign} ${subAdminFee}`}
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                            ) : null}
                        </View>
                    </View>
                    <View style={styles.networkFee}>
                        <AppText
                            titleWithI18n={LanguageKey.send_network_fee_title}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={theme.colors.text_on_surface_text_light}
                        />
                        <View style={appStyles.alignItemsEnd}>
                            <AppText
                                title={`${commonUtils.formattedBalanceCurrency(networkFee)} ${protocolSelected?.name}`}
                                variant={TextVariantKeys.bodyMMedium}
                            />
                            {subNetworkFee ? (
                                <AppText
                                    title={`~ ${sign} ${subNetworkFee}`}
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                            ) : null}
                        </View>
                    </View>
                    <View style={styles.networkFee}>
                        <AppText
                            titleWithI18n={LanguageKey.common_total_amount}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={theme.colors.text_on_surface_text_light}
                        />
                        <View style={appStyles.alignItemsEnd}>
                            <AppText
                                title={`${commonUtils.formattedBalanceCurrency(totalAmount)} ${protocolSelected?.name}`}
                                variant={TextVariantKeys.bodyMMedium}
                            />
                            {subAdminFee && subNetworkFee ? (
                                <AppText
                                    title={`~ ${selectedCurrencySetting && selectedCurrencySetting.sign} ${subNetworkFee + subAdminFee}`}
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                            ) : null}
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.buttonConfirm}>
                {newUI ? (
                    <AppButtonSVG
                        onPress={confirmAction}
                        titleWithI18n={LanguageKey.common_text_confirm}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        styles={styles.button}
                        isLoading={isLoadingPage}
                        SvgView={SvgView.button}
                    />
                ) : (
                    <AppButton
                        onPress={confirmAction}
                        titleWithI18n={LanguageKey.common_text_confirm}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        styles={styles.button}
                        isLoading={isLoadingPage}
                    />
                )}
            </View>
        </>
    );
};

export default ConfirmTonView;
