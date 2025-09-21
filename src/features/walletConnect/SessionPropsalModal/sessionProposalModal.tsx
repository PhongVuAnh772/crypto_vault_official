import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppImage from 'src/components/common/AppImage';
import AppLoading from 'src/components/common/AppLoading';
import AppText from 'src/components/common/AppText';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import {
    InfoCircleSvgIcon,
    PulseSvgIcon,
    WalletConnectSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import { ListChainRequire } from '../index.component';
import useStyles from './sessionProposal.stye';
import useSessionProposal from './useSessionProposal';

export default function SessionProposalModal() {
    const {
        theme,
        proposal,
        bottomSheetConnectRef,
        isEnableDismissOnClose,
        protocolDataLists,
        currentAccount,
        visibleLoading,
        supportedName,
        wallet,
        insets,
        onApprove,
        onReject,
    } = useSessionProposal();
    const style = useStyles(theme, insets);
    const getDomainUrl = (url?: string) => {
        const domain = url?.replace(/^https?:\/\//, '') ?? '';
        return domain;
    };
    const { t } = useTranslation();

    return (
        <View style={appStyles.flex1}>
            <BottomSheetModalGorhom
                refModal={bottomSheetConnectRef}
                onDismiss={() => {
                    onReject(false);
                }}
                enableDismissOnClose={isEnableDismissOnClose}
                enableContentPanningGesture={!Utils.isAndroid}>
                {proposal ? (
                    <View style={[style.view_connect]}>
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <AppText
                                titleWithI18n={
                                    LanguageKey.common_text_connect_to
                                }
                                variant={TextVariantKeys.titleLarge}
                                textColor={
                                    theme.colors.text_on_surface_text_highest
                                }
                            />
                            <View style={[appStyles.flexRow, appStyles.mbt10]}>
                                <AppText
                                    title={getDomainUrl(
                                        proposal?.params.proposer.metadata.url,
                                    )}
                                    variant={TextVariantKeys.titleLarge}
                                    textColor={appColors.main.tokyoRed}
                                />

                                <AppText
                                    title={'?'}
                                    variant={TextVariantKeys.titleLarge}
                                    textColor={
                                        theme.colors
                                            .text_on_surface_text_highest
                                    }
                                />
                            </View>
                            <AppText
                                titleWithI18n={t(
                                    LanguageKey.common_text_requesting_wallet_address,
                                    {
                                        dapp_name:
                                            proposal?.params.proposer.metadata
                                                .name,
                                    },
                                )}
                                styles={appStyles.textAlignCenter}
                                variant={TextVariantKeys.bodyRMedium}
                                textColor={
                                    theme.colors.text_on_surface_text_high
                                }
                            />
                            <View
                                style={[
                                    appStyles.flexRow,
                                    appStyles.alignContentBetween,
                                    appStyles.center,
                                    appStyles.pV10,
                                ]}>
                                <WalletConnectSvgIcon width={50} height={50} />
                                <View style={appStyles.mh20}>
                                    <PulseSvgIcon />
                                </View>
                                <AppImage
                                    uri={
                                        proposal?.params.proposer.metadata
                                            .icons[0]
                                    }
                                    styleImage={style.image}
                                />
                            </View>
                        </View>
                        <View style={[appStyles.flex3]}>
                            {currentAccount && (
                                <ListChainRequire
                                    listChain={supportedName.chains.flat()}
                                    protocolDataLists={protocolDataLists}
                                    currentAccount={currentAccount}
                                    address={wallet?.address!}
                                />
                            )}
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
                                textColor={
                                    theme.colors.text_on_surface_text_medium
                                }
                                styles={appStyles.ml12}
                                maxFontSizeMultiplier={1.2}
                            />
                        </View>
                        <AppButtonSVG
                            titleWithI18n={LanguageKey.common_text_connect}
                            styles={{
                                backgroundColor: theme.colors.onPrimary,
                            }}
                            textColor={theme.colors.text_on_surface_text_brand}
                            onPress={onApprove}
                            SvgView={SvgView.button}
                            textVariant={TextVariantKeys.bodyMMedium}
                            isLoading={visibleLoading}
                        />
                    </View>
                ) : (
                    <View style={[appStyles.center, appStyles.flex1]}>
                        <AppLoading styles={appStyles.pd10} size={30} />
                    </View>
                )}
            </BottomSheetModalGorhom>
        </View>
    );
}
