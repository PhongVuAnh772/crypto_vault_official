import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, Keyboard, StyleSheet, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import AppTextInput from 'src/components/common/AppTextInput';
import appColors from 'src/core/constants/AppColors';
import { EmptyTransactionSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { LoadingWrapper } from '../../bottomTab/NFTCollection/NFTCollectionTab/components/NFTCollection.components';
import {
    ClaimHistory,
    ClaimableType,
    OwnedNFTType,
} from '../../bottomTab/explore/explore.type';
import { containerStyles } from '../details/projectDetails.style';
import { useStyles } from './confirmClaimToken.style';
import {
    ContactSupportModalProps,
    LoadingConfirmListViewType,
    ProjectDetailChildProps,
    ProjectInformationProps,
    ProtocolNFTViewProps,
    TotalClaimingFooterProps,
} from './confirmClaimToken.type';

export const renderNFTYouConfirmList = (
    item: ClaimHistory | OwnedNFTType,
    theme: AppThemeType,
    dataClaimable: ClaimableType | null,
    insets: EdgeInsets,
    loading = false,
    inModal = false,
) => {
    const styles = containerStyles(theme, insets);
    return (
        <View style={[appStyles.mv10]}>
            <View>
                <View
                    style={[
                        appStyles.justifyContentBetween,
                        appStyles.alignItemsCenter,
                        appStyles.flex1,
                        appStyles.flexRow,
                    ]}>
                    <LoadingWrapper
                        loading={loading}
                        skeletonWidth={150}
                        containerSkeleton={appStyles.ml10}
                        skeletonHeight={15}>
                        <View
                            style={[
                                appStyles.flexRow,
                                appStyles.alignItemsCenter,
                            ]}>
                            <AppText
                                title={`#${item?.nftId}`}
                                variant={TextVariantKeys.bodyMLarge}
                                textColor={
                                    inModal
                                        ? theme.colors.text_on_surface_text_high
                                        : theme.colors
                                              .text_on_surface_text_highest
                                }
                            />
                            <View style={appStyles.ml5}>
                                {dataClaimable?.projectNftProtocol?.name && (
                                    <View
                                        style={[
                                            appStyles.ml5,
                                            dataClaimable?.projectNftProtocol
                                                ?.name?.length > 16
                                                ? styles.protocolNFTViewContainer
                                                : undefined,
                                        ]}>
                                        <ProtocolNFTView
                                            loading={loading}
                                            theme={theme}
                                            protocol_name={
                                                dataClaimable
                                                    ?.projectNftProtocol?.name
                                            }
                                            project_image={
                                                dataClaimable
                                                    ?.projectNftProtocol?.logo
                                            }
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                    </LoadingWrapper>
                    <LoadingWrapper
                        loading={loading}
                        skeletonWidth={50}
                        skeletonHeight={15}>
                        <AppText
                            title={`${Utils.formattedAmountClaim(item?.amount)}`}
                            variant={TextVariantKeys.bodyMLarge}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                        />
                    </LoadingWrapper>
                </View>
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.justifyContentBetween,
                        appStyles.flex1,
                        appStyles.alignItemsCenter,
                    ]}>
                    <LoadingWrapper
                        loading={loading}
                        skeletonWidth={50}
                        containerSkeleton={[appStyles.ml10, appStyles.mt5]}
                        skeletonHeight={15}>
                        <View style={[appStyles.mt10, appStyles.flex3]}>
                            <AppText
                                title={dataClaimable?.projectNFT?.name}
                                variant={TextVariantKeys.bodyMSmall}
                                textColor={
                                    theme.colors.text_on_surface_text_light
                                }
                                numberOfLines={1}
                                styles={appStyles.textAlignLeft}
                            />
                        </View>
                    </LoadingWrapper>
                    <LoadingWrapper
                        loading={loading}
                        skeletonWidth={50}
                        skeletonHeight={15}>
                        <AppText
                            title={dataClaimable?.projectToken?.symbol}
                            variant={TextVariantKeys.bodyMLarge}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                            styles={[
                                appStyles.flex1,
                                appStyles.textAlignRight,
                                appStyles.mt10,
                            ]}
                        />
                    </LoadingWrapper>
                </View>
            </View>
        </View>
    );
};

export const TotalClaimingFooter: React.FC<TotalClaimingFooterProps> = ({
    total,
    theme,
    loading,
    enableToken,
}) => {
    const { t } = useTranslation();
    return (
        <View
            style={[
                appStyles.justifyContentBetween,
                appStyles.alignItemsCenter,
                appStyles.flexRow,
                appStyles.pT15,
                {
                    borderTopWidth: 0.6,
                    borderTopColor: theme.colors.outline_outine,
                },
            ]}>
            <View>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={100}
                    containerSkeleton={appStyles.mbt5}
                    skeletonHeight={15}>
                    <AppText
                        titleWithI18n={LanguageKey.confirm_claim_total_claim}
                        variant={TextVariantKeys.titleSmall}
                        textColor={theme.colors.text_on_surface_text_highest}
                    />
                </LoadingWrapper>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={100}
                    containerSkeleton={appStyles.mbt5}
                    skeletonHeight={15}>
                    <AppText
                        title={`(${t(LanguageKey.confirm_claim_dynamic_token, {
                            dynamicToken:
                                enableToken ??
                                t(LanguageKey.common_text_JETTON),
                        })})`}
                        variant={TextVariantKeys.bodyRSmall}
                        textColor={theme.colors.text_on_surface_text_highest}
                        styles={appStyles.pV10}
                    />
                </LoadingWrapper>
            </View>
            <LoadingWrapper
                loading={loading}
                skeletonWidth={100}
                skeletonHeight={15}>
                <AppText
                    title={Utils.formattedAmountClaimTotal(total).toString()}
                    variant={TextVariantKeys.titleSmall}
                    textColor={appColors.main.tokyoRed}
                />
            </LoadingWrapper>
        </View>
    );
};

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
    theme,
    visibleModal,
    disableAction,
    acceptAction,
    nameContact,
    setNameContact,
    emailContact,
    setEmailContact,
    inquiryContact,
    setInquiryContact,
    disabled,
    loading,
}) => {
    const styles = useStyles(theme);
    const { t } = useTranslation();
    return (
        <AppModal
            onTouchOutside={() => Keyboard.dismiss()}
            titleWithI18n={LanguageKey.setting_contact_support}
            visible={visibleModal}
            onPress2={disableAction}
            buttonTitleWithI18n2={LanguageKey.common_text_cancel}
            onPress={acceptAction}
            twoOptions={true}
            buttonTitleWithI18n={LanguageKey.submit}
            enablePaddingSubTitle
            buttonSecondContainerStyle={styles.cancelActionSwitching}
            textButtonSecondColor={appColors.main.tokyoRed}
            buttonDisabled={disabled}
            enableKeyboard
            footerView={
                <View style={[styles.modalContainer, appStyles.flexRow]}>
                    <View style={appStyles.flex1}>
                        <View style={[appStyles.pB15]}>
                            <AppTextInput
                                labelName={t(
                                    LanguageKey.claim_token_support_name,
                                )}
                                required
                                placeholder={t(LanguageKey.common_enter_name)}
                                styleTextInput={[
                                    {
                                        backgroundColor:
                                            theme.colors.surface_surface_high,
                                        color: theme.colors
                                            .text_on_surface_text_high,
                                    },
                                ]}
                                value={nameContact}
                                onChangeText={setNameContact}
                            />
                        </View>
                        <View style={[appStyles.pV15]}>
                            <AppTextInput
                                labelName={t(
                                    LanguageKey.claim_token_support_email,
                                )}
                                required
                                placeholder={t(LanguageKey.common_enter_email)}
                                styleTextInput={[
                                    {
                                        backgroundColor:
                                            theme.colors.surface_surface_high,
                                        color: theme.colors
                                            .text_on_surface_text_high,
                                    },
                                    { textTransform: 'none' },
                                ]}
                                value={emailContact}
                                onChangeText={setEmailContact}
                            />
                        </View>
                        <View style={[appStyles.pV15]}>
                            <AppTextInput
                                labelName={t(LanguageKey.setting_inquiry)}
                                required
                                placeholder={t(
                                    LanguageKey.common_enter_inquiry,
                                )}
                                styleTextInput={[
                                    styles.texterea,
                                    {
                                        backgroundColor:
                                            theme.colors.surface_surface_high,
                                        color: theme.colors
                                            .text_on_surface_text_high,
                                    },
                                ]}
                                numberOfLines={10}
                                multiline
                                value={inquiryContact}
                                onChangeText={setInquiryContact}
                            />
                        </View>
                    </View>
                    <View></View>
                </View>
            }
        />
    );
};

export const ProtocolNFTView: React.FC<ProtocolNFTViewProps> = ({
    loading,
    theme,
    protocol_name,
    project_image,
    enableDivider = true,
    usingWithExplore = false,
}) => {
    const containerStyles = protocolNFTViewStyle(theme);
    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                appStyles.ml5,
                usingWithExplore && appStyles.mt5,
            ]}>
            {enableDivider && <View style={containerStyles.divider} />}
            <LoadingWrapper
                loading={loading as boolean}
                skeletonWidth={20}
                containerSkeleton={containerStyles.imageToken}
                skeletonHeight={20}>
                <Image
                    source={{ uri: project_image }}
                    style={containerStyles.imageToken}
                />
            </LoadingWrapper>
            <LoadingWrapper
                loading={loading as boolean}
                skeletonWidth={50}
                containerSkeleton={containerStyles.imageToken}
                skeletonHeight={20}>
                <AppText
                    title={protocol_name}
                    variant={
                        usingWithExplore
                            ? TextVariantKeys.bodyRSmall
                            : TextVariantKeys.bodyMMedium
                    }
                    textColor={theme.colors.text_on_surface_text_high}
                    styles={appStyles.ml5}
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.2}
                />
            </LoadingWrapper>
        </View>
    );
};

export const ProjectInformation: React.FC<ProjectInformationProps> = ({
    theme,
    project_name,
    wallet_1,
    recipient_address,
    loading,
}) => {
    const styles = useStyles(theme);
    return (
        <View style={styles.project}>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                ]}>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={100}
                    containerSkeleton={appStyles.mbt5}
                    skeletonHeight={15}>
                    <AppText
                        titleWithI18n={LanguageKey.confirm_claim_project_name}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_light}
                        styles={[appStyles.flex4]}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.2}
                    />
                </LoadingWrapper>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={100}
                    containerSkeleton={appStyles.mbt5}
                    skeletonHeight={15}>
                    <AppText
                        title={project_name}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_high}
                        styles={[appStyles.textAlignRight, appStyles.flex6]}
                        maxFontSizeMultiplier={1.2}
                        numberOfLines={2}
                    />
                </LoadingWrapper>
            </View>

            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                    appStyles.pT15,
                ]}>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={100}
                    containerSkeleton={appStyles.mbt5}
                    skeletonHeight={15}>
                    <AppText
                        titleWithI18n={
                            LanguageKey.confirm_claim_recipient_address
                        }
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_light}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.2}
                    />
                </LoadingWrapper>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={100}
                    containerSkeleton={appStyles.mbt5}
                    skeletonHeight={15}>
                    <AppText
                        title={WalletUtils.getShortMoreAddress(
                            recipient_address,
                        )}
                        styles={[appStyles.flex1, appStyles.textAlignRight]}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_high}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.2}
                    />
                </LoadingWrapper>
            </View>
        </View>
    );
};

export const LoadingConfirmListView: React.FC<LoadingConfirmListViewType> = ({
    isLoading,
}) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);
    const getView = () => {
        if (!isLoading) {
            return (
                <View style={[appStyles.center, styles.loadingListContainer]}>
                    <View style={[appStyles.mbt10]}>
                        <EmptyTransactionSvgIcon
                            color={appColors.neutral.n600}
                        />
                    </View>
                    <AppText
                        titleWithI18n={
                            LanguageKey.claim_token_detail_empty_title
                        }
                        textColor={theme.colors.text_on_surface_text_medium}
                        variant={TextVariantKeys.bodyRMedium}
                    />
                </View>
            );
        }
        return (
            <View style={[styles.loadingListContainer]}>
                {[1, 2, 3].map(item => {
                    return (
                        <View
                            style={[appStyles.flexRow, appStyles.mt15]}
                            key={item}>
                            <View
                                style={[
                                    appStyles.justifyContentBetween,
                                    appStyles.alignItemsCenter,
                                    appStyles.flex1,
                                    appStyles.flexRow,
                                ]}>
                                <View
                                    style={[
                                        appStyles.justifyContentBetween,
                                        appStyles.flex1,
                                    ]}>
                                    <LoadingWrapper
                                        loading={isLoading}
                                        skeletonWidth={150}
                                        skeletonHeight={15}>
                                        <View
                                            style={[
                                                appStyles.flexRow,
                                                appStyles.alignItemsCenter,
                                            ]}>
                                            <View style={[appStyles.ml5]}>
                                                <ProtocolNFTView
                                                    loading={isLoading}
                                                    theme={theme}
                                                    protocol_name={''}
                                                    project_image={''}
                                                />
                                            </View>
                                        </View>
                                    </LoadingWrapper>

                                    <LoadingWrapper
                                        loading={isLoading}
                                        skeletonWidth={100}
                                        containerSkeleton={appStyles.mt10}
                                        skeletonHeight={15}>
                                        <View />
                                    </LoadingWrapper>
                                </View>
                                <View>
                                    <LoadingWrapper
                                        loading={isLoading}
                                        skeletonWidth={50}
                                        skeletonHeight={15}>
                                        <View />
                                    </LoadingWrapper>
                                    <LoadingWrapper
                                        loading={isLoading}
                                        skeletonWidth={50}
                                        containerSkeleton={appStyles.mt10}
                                        skeletonHeight={15}>
                                        <View />
                                    </LoadingWrapper>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    return getView();
};

export const ProjectDetailChild: React.FC<ProjectDetailChildProps> = ({
    theme,
    dataClaimable,
    dataGetOwned,
    loading,
    totalClaim,
    insets,
    enableToken,
}) => {
    const styles = useStyles(theme);
    return (
        <View>
            {dataGetOwned && dataGetOwned?.length > 0 ? (
                <View style={styles.projectDetailConfirm}>
                    <FlatList
                        bounces={false}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                        data={dataGetOwned as OwnedNFTType[]}
                        renderItem={({ item }) =>
                            renderNFTYouConfirmList(
                                item,
                                theme,
                                dataClaimable,
                                insets,
                                loading,
                                true,
                            )
                        }
                    />
                    {dataGetOwned && dataGetOwned?.length > 0 ? (
                        <TotalClaimingFooter
                            total={totalClaim}
                            theme={theme}
                            loading={loading}
                            enableToken={enableToken}
                        />
                    ) : null}
                </View>
            ) : (
                <LoadingConfirmListView isLoading={loading} />
            )}
        </View>
    );
};

const protocolNFTViewStyle = (theme: AppThemeType) => {
    return StyleSheet.create({
        divider: {
            height: '100%',
            width: 1,
            backgroundColor: theme.colors.text_on_surface_text_light,
            marginRight: 10,
        },
        imageToken: {
            width: 20,
            height: 20,
            borderRadius: 50,
        },
    });
};
