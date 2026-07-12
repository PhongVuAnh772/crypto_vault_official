import { Address } from '@ton/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppImage from 'src/components/common/AppImage';
import AppSkeletonLoading from 'src/components/common/AppSkeletonLoading';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import {
    CloseSvgIcon,
    InfoCircleSvgIcon,
    LinkSvgIcon,
    PulseSvgIcon,
    TonSvgIcon,
    WalletLogoSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import TonEventType from 'src/core/enum/TonEventType';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { AddressListItemType } from 'src/core/redux/slice/account.type';
import TonConnectUtils from 'src/core/services/TonConnect/TonConnectUntil';
import appStyles from 'src/core/styles';
import TonUtils from 'src/core/utils/tonUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { DAppManifest, TonTransactionAction } from '../slice/tonConnect.type';
import useStyles from '../tonConnectStyle';
interface TonConnectViewType {
    infoDapp?: DAppManifest;
    tonAddressData?: AddressListItemType ;
    confirm: () => void;
}
interface TransactionViewType {
    dataList?: TonTransactionAction[];
    confirm: () => void;
    emulate: boolean;
    insufficientBalance: boolean;
    loading?: boolean;
    reject: () => void;
}
const TonConnectView = ({
    infoDapp,
    tonAddressData,
    confirm,
}: TonConnectViewType) => {
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const style = useStyles(theme, insets);
    const { t } = useTranslation();
    const url = TonConnectUtils.getDomainUrl(infoDapp?.url);
    return (
        <View style={style.container}>
            {infoDapp && tonAddressData ? (
                <View style={appStyles.flex1}>
                    <View style={appStyles.center}>
                        <AppText
                            titleWithI18n={t(
                                LanguageKey.common_text_connect_to,
                            )}
                            variant={TextVariantKeys.titleLarge}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                        />
                        <View style={[appStyles.flexRow, appStyles.mbt10]}>
                            <AppText
                                title={url}
                                variant={TextVariantKeys.titleLarge}
                                textColor={appColors.main.tokyoRed}
                            />
                            <AppText
                                title={'?'}
                                variant={TextVariantKeys.titleLarge}
                                textColor={
                                    theme.colors.text_on_surface_text_highest
                                }
                            />
                        </View>

                        <AppText
                            titleWithI18n={t(
                                LanguageKey.common_text_requesting_wallet_address,
                                {
                                    dapp_name: infoDapp.name,
                                },
                            )}
                            styles={appStyles.textAlignCenter}
                            variant={TextVariantKeys.bodyRMedium}
                            textColor={theme.colors.text_on_surface_text_high}
                        />
                        <View
                            style={[
                                appStyles.flexRow,
                                appStyles.alignContentBetween,
                                appStyles.center,
                                appStyles.pV10,
                            ]}>
                            <TonSvgIcon width={50} height={50} />
                            <View style={appStyles.mh20}>
                                <PulseSvgIcon />
                            </View>
                            <AppImage
                                uri={infoDapp?.iconUrl}
                                styleImage={style.image}
                            />
                        </View>
                    </View>
                    <View style={[ appStyles.pT15]}>
                        <View style={style.infoWallet}>
                            <View style={style.accountIcon}>
                                <WalletLogoSvgIcon
                                    color={tonAddressData.avtColor}
                                />
                            </View>
                            <View>
                                <AppText
                                    title={tonAddressData.name}
                                    variant={TextVariantKeys.titleSmall}
                                    textColor={
                                        theme.colors.text_on_surface_text_high
                                    }
                                />
                                <AppText
                                    title={WalletUtils.getShortAddress(
                                        tonAddressData.address,
                                        8,
                                    )}
                                    variant={TextVariantKeys.bodyRSmall}
                                    textColor={appColors.neutral.black}
                                    styles={appStyles.mt5}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={style.warning}>
                        <InfoCircleSvgIcon
                            width={32}
                            height={32}
                            color={appColors.functional.yellow}
                        />
                        <AppText
                            titleWithI18n={
                                LanguageKey.common_text_check_service_address
                            }
                            variant={TextVariantKeys.bodyRSmall}
                            textColor={theme.colors.text_on_surface_text_medium}
                            styles={appStyles.ml12}
                            maxFontSizeMultiplier={1.2}
                        />
                    </View>
                    <View
                        style={[appStyles.flex1, appStyles.justifyContentEnd]}>
                        <AppButtonSVG
                            titleWithI18n={LanguageKey.common_text_connect}
                            styles={{ backgroundColor: theme.colors.onPrimary }}
                            textColor={theme.colors.text_on_surface_text_brand}
                            onPress={confirm}
                            SvgView={SvgView.button}
                            textVariant={TextVariantKeys.bodyMMedium}
                        />
                    </View>
                </View>
            ) : (
                <View style={appStyles.flex1}>
                    <View style={[appStyles.alignItemsCenter]}>
                        <AppSkeletonLoading width={100} height={25} />
                        <View style={appStyles.mv10}>
                            <AppSkeletonLoading width={160} height={25} />
                        </View>
                    </View>

                    <View style={[appStyles.center]}>
                        <View style={appStyles.mv15}>
                            <AppSkeletonLoading width={320} height={25} />
                        </View>
                        <AppSkeletonLoading width={150} height={25} />
                    </View>
                    <View
                        style={[
                            appStyles.flexRow,
                            appStyles.alignContentBetween,
                            appStyles.center,
                            appStyles.mv30,
                        ]}>
                        <AppSkeletonLoading
                            width={50}
                            height={50}
                            radius={20}
                        />
                        <View style={appStyles.mh25} />
                        <AppSkeletonLoading
                            width={50}
                            height={50}
                            radius={20}
                        />
                    </View>
                    <AppSkeletonLoading width={'100%'} height={90} />
                    <View style={appStyles.mt20}>
                        <AppSkeletonLoading width={'100%'} height={60} />
                    </View>
                    <View style={style.buttonConfirm}>
                        <AppSkeletonLoading width={'100%'} height={50} />
                    </View>
                </View>
            )}
        </View>
    );
};
const ConFirmTransactionView = ({
    dataList,
    confirm,
    loading,
    emulate,
    insufficientBalance,
    reject,
}: TransactionViewType) => {
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const style = useStyles(theme, insets);

    return (
        <View style={style.container}>
            {loading ? (
                <View style={appStyles.flex1}>
                    <AppText
                        titleWithI18n={
                            LanguageKey.common_text_confirm_transaction
                        }
                        variant={TextVariantKeys.titleLarge}
                        styles={appStyles.textAlignCenter}
                        textColor={theme.colors.text_on_surface_text_highest}
                    />
                    {emulate && dataList ? (
                        <FlatList
                            data={dataList}
                            style={appStyles.pV10}
                            renderItem={({ item, index }) => (
                                <RenderTonAction item={item} index={index} />
                            )}
                        />
                    ) : (
                        <View
                            style={[
                                appStyles.flex1,
                                appStyles.justifyContentCenter,
                            ]}>
                            <View style={style.view_emulate}>
                                <CloseSvgIcon
                                    width={32}
                                    height={32}
                                    color={appColors.main.tokyoRed}
                                />
                                <AppText
                                    titleWithI18n={
                                        insufficientBalance
                                            ? LanguageKey.common_text_insufficient_balance
                                            : LanguageKey.common_text_emulate_fall
                                    }
                                    styles={appStyles.ml12}
                                    variant={TextVariantKeys.titleSmall}
                                    textColor={appColors.neutral.n800}
                                />
                            </View>
                        </View>
                    )}
                    <View style={appStyles.flexRow}>
                        <AppButtonSVG
                            titleWithI18n={LanguageKey.common_text_confirm}
                            onPress={emulate ? confirm : reject}
                            styles={style.buttonTransactionConfirm}
                            SvgView={SvgView.button}
                            textColor={theme.colors.text_on_surface_text_brand}
                        />
                    </View>
                </View>
            ) : (
                <View style={appStyles.flex1}>
                    <View style={appStyles.alignItemsCenter}>
                        <AppSkeletonLoading width={200} height={25} />
                    </View>
                    <FlatList
                        data={[0, 1, 2]}
                        style={appStyles.pV10}
                        renderItem={() => (
                            <View style={style.itemTransaction}>
                                <View
                                    style={[
                                        appStyles.flexRow,
                                        appStyles.center,
                                    ]}>
                                    <AppSkeletonLoading
                                        width={36}
                                        height={36}
                                    />
                                    <View style={appStyles.ml10}>
                                        <AppSkeletonLoading
                                            width={120}
                                            height={20}
                                        />
                                        <View style={appStyles.mv5} />
                                        <AppSkeletonLoading
                                            width={120}
                                            height={20}
                                        />
                                    </View>
                                </View>
                                <AppSkeletonLoading width={60} height={25} />
                            </View>
                        )}
                    />
                    <AppSkeletonLoading width={'100%'} height={40} />
                </View>
            )}
        </View>
    );
};
const RenderTonAction = ({
    item,
    index,
}: {
    item: TonTransactionAction;
    index: number;
}) => {
    const getImage = (type: TonEventType) => {
        switch (type) {
            case TonEventType.TonTransfer:
                return <TonSvgIcon width={36} height={36} />;
            case TonEventType.NftItemTransfer:
                return (
                    <AppImage
                        width={36}
                        height={36}
                        uri={item.dataNft.image}
                        resizeMode="cover"
                    />
                );
            case TonEventType.JettonTransfer:
                return (
                    <AppImage
                        width={36}
                        height={36}
                        uri={item.dataJetton.image}
                        resizeMode="cover"
                    />
                );
            default:
                return (
                    <View style={style.icon_default}>
                        <LinkSvgIcon width={20} height={20} />
                    </View>
                );
        }
    };
    const getSymPoy = (type: TonEventType) => {
        switch (type) {
            case TonEventType.TonTransfer:
                return ' TON';
            case TonEventType.JettonTransfer:
                return item.dataJetton.symbol;
            default:
                return ' TON';
        }
    };
    const getTitle = (type: TonEventType) => {
        switch (type) {
            case TonEventType.TonTransfer:
                return (
                    <AppText
                        title={'TON Transfer'}
                        textColor={theme.colors.text_on_surface_text_high}
                        variant={TextVariantKeys.bodyMMedium}
                    />
                );
            case TonEventType.NftItemTransfer:
                return (
                    <AppText
                        title={'NFT Transfer'}
                        textColor={theme.colors.text_on_surface_text_high}
                        variant={TextVariantKeys.bodyMMedium}
                    />
                );
            case TonEventType.JettonTransfer:
                return (
                    <AppText
                        title={'Jetton Transfer'}
                        textColor={theme.colors.text_on_surface_text_high}
                        variant={TextVariantKeys.bodyMMedium}
                    />
                );
            default:
                return (
                    <AppText
                        title={type}
                        textColor={theme.colors.text_on_surface_text_high}
                        variant={TextVariantKeys.bodyMMedium}
                    />
                );
        }
    };
    const { t } = useTranslation();
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const style = useStyles(theme, insets);
    const addressReceiveRaw = item.recipientAddress;
    const addressReceive =
        addressReceiveRaw &&
        WalletUtils.getShortAddress(
            Address.parse(addressReceiveRaw).toString(),
            8,
        );
    return (
        <View style={style.itemTransaction}>
            <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                {getImage(item.type)}
                <View style={appStyles.ml12}>
                    {getTitle(item.type)}
                    {item?.type === TonEventType.NftItemTransfer && (
                        <AppText
                            title={item.dataNft.name}
                            textColor={theme.colors.text_on_surface_text_light}
                            variant={TextVariantKeys.bodyMSmall}
                        />
                    )}
                    <AppText
                        title={
                            t(LanguageKey.common_text_to) + ': ' + addressReceive
                        }
                        textColor={theme.colors.text_on_surface_text_light}
                        variant={TextVariantKeys.bodyMSmall}
                    />
                </View>
            </View>
            {item.amount && (
                <AppText
                    title={
                        TonUtils.formatBigNumber(item.amount.toString()) +
                        getSymPoy(item.type)
                    }
                    variant={TextVariantKeys.titleSmall}
                    textColor={appColors.neutral.black}
                    styles={appStyles.textAlignRight}
                />
            )}
           
        </View>
    );
};
export { ConFirmTransactionView, TonConnectView };
