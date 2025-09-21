import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { Close2SvgIcon, SendDownSvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';
import useStyles from './send.evm.style';
import {
    BottomSheetContentConfirmationType,
    GivePermissionToken,
} from './send.evm.type';

const GivePermissionSpendToken = ({
    theme,
    estimateGas,
    sendAmount,
    tokenName,
    handleConfirm,
    isLoading,
    commissionAmount,
    totalAmount,
    onClose,
    disable,
}: GivePermissionToken) => {
    const styles = useStyles(theme);
    const { t } = useTranslation();

    return (
        <>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.pd25, styles.flex1]}>
                    <TouchableOpacity
                        disabled={disable}
                        style={styles.closeButtonBottomSheet}
                        onPress={onClose}>
                        <Close2SvgIcon
                            color={theme.colors.outline_outine_strong}
                        />
                    </TouchableOpacity>
                    <AppText
                        titleWithI18n={LanguageKey.nft_request_permission_title}
                        variant={TextVariantKeys.titleLarge}
                        styles={styles.textAlignCenter}
                        textColor={appColors.neutral.black}
                    />
                    <View style={styles.mt15}>
                        <AppText
                            titleWithI18n={t(
                                LanguageKey.send_request_permission_sub_title,
                                {
                                    name: tokenName,
                                },
                            )}
                            variant={TextVariantKeys.bodyRMedium}
                            styles={styles.textAlignCenter}
                            textColor={appColors.neutral.n600}
                        />
                    </View>

                    <View style={styles.boxFee}>
                        <View
                            style={[
                                styles.flexRow,
                                styles.justifyContentBetween,
                                styles.mt15,
                                styles.totalGrantAmount,
                            ]}>
                            <AppText
                                titleWithI18n={
                                    LanguageKey.common_total_grant_amount
                                }
                                variant={TextVariantKeys.bodyMLarge}
                                styles={styles.textAlignLeft}
                                textColor={
                                    theme.colors.text_on_surface_text_medium
                                }
                            />
                            <AppText
                                title={totalAmount}
                                variant={TextVariantKeys.titleMedium}
                                styles={styles.textAlignRight}
                                textColor={appColors.neutral.n800}
                            />
                        </View>
                        <View
                            style={[
                                styles.flexRow,
                                styles.justifyContentBetween,
                                styles.mt15,
                            ]}>
                            <AppText
                                titleWithI18n={LanguageKey.common_token_name}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={styles.textAlignLeft}
                                textColor={appColors.neutral.n500}
                            />
                            <AppText
                                title={tokenName}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={styles.textAlignCenter}
                                textColor={appColors.neutral.n800}
                            />
                        </View>
                        <View
                            style={[
                                styles.flexRow,
                                styles.justifyContentBetween,
                                styles.mt20,
                            ]}>
                            <AppText
                                titleWithI18n={LanguageKey.common_token_amount}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={styles.textAlignLeft}
                                textColor={appColors.neutral.n500}
                            />
                            <AppText
                                title={sendAmount}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={styles.textAlignRight}
                                textColor={appColors.neutral.n800}
                            />
                        </View>
                        <View
                            style={[
                                styles.flexRow,
                                styles.justifyContentBetween,
                                styles.mt20,
                            ]}>
                            <AppText
                                titleWithI18n={
                                    LanguageKey.send_service_fee_title
                                }
                                variant={TextVariantKeys.bodyMMedium}
                                styles={styles.textAlignLeft}
                                textColor={appColors.neutral.n500}
                            />
                            <AppText
                                title={commissionAmount}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={styles.textAlignRight}
                                textColor={appColors.neutral.n800}
                            />
                        </View>
                        <View
                            style={[
                                styles.flexRow,
                                styles.justifyContentBetween,
                                styles.mt20,
                                styles.alignItemsCenter,
                            ]}>
                            <AppText
                                titleWithI18n={LanguageKey.nft_estimate_gas_fee}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={styles.textAlignLeft}
                                textColor={appColors.neutral.n500}
                            />
                            <AppText
                                title={estimateGas}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={styles.textAlignRight}
                                textColor={appColors.neutral.n800}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View style={[styles.pH25, styles.pB15]}>
                <AppButton
                    onPress={handleConfirm}
                    titleWithI18n={LanguageKey.common_text_confirm}
                    textVariant={TextVariantKeys.bodyMMedium}
                    textColor={appColors.neutral.white}
                    styles={[styles.button]}
                    isLoading={isLoading}
                />
            </View>
        </>
    );
};

const BottomSheetContentConfirmation = ({
    theme,
    sender,
    amount,
    amountFollowCurrency,
    logo,
    recipient,
    serviceFee,
    estimateGas,
    handleConfirm,
    isLoading,
    totalAmount,
    onClose,
    disable,
}: BottomSheetContentConfirmationType) => {
    const styles = useStyles(theme);
    const defaultImage = appImages.logo;
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    return (
        <View style={[styles.flex1, styles.mbt15]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.flex1, styles.pH25]}>
                    <TouchableOpacity
                        disabled={disable}
                        style={styles.closeButtonBottomSheetConfirm}
                        onPress={onClose}>
                        <Close2SvgIcon
                            color={theme.colors.outline_outine_strong}
                        />
                    </TouchableOpacity>
                    <View
                        style={[
                            styles.mbt20,
                            styles.alignItemsCenter,
                            styles.mt15,
                        ]}>
                        <AppText
                            titleWithI18n={LanguageKey.common_text_confirmation}
                            variant={TextVariantKeys.titleLarge}
                            textColor={theme.colors.text_on_surface_text_high}
                        />
                    </View>
                    <View style={styles.containerBox}>
                        <View
                            style={[
                                styles.flexRow,
                                styles.justifyContentBetween,
                                styles.alignItemsCenter,
                            ]}>
                            <View style={styles.titleBox}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_from}
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                            </View>
                            <AppText
                                title={sender}
                                variant={TextVariantKeys.titleSmall}
                                textColor={
                                    theme.colors.text_on_surface_text_high
                                }
                            />
                        </View>
                        <View
                            style={[
                                styles.flexRow,
                                styles.mt15,
                                styles.alignItemsCenter,
                            ]}>
                            <View style={styles.flex1}>
                                <AppText
                                    title={amount}
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors.text_on_surface_text_high
                                    }
                                />

                                <AppText
                                    title={amountFollowCurrency}
                                    variant={TextVariantKeys.titleSmall}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                            </View>
                            <AppImage
                                uri={logo}
                                styleImage={styles.iconCircleSize32}
                                defaultImage={defaultImage}
                            />
                        </View>
                    </View>
                    <View style={[styles.alignItemsCenter, styles.mv15]}>
                        <SendDownSvgIcon />
                    </View>
                    <View style={styles.containerBox}>
                        <View
                            style={[
                                styles.flexRow,
                                styles.justifyContentBetween,
                                styles.alignItemsCenter,
                            ]}>
                            <View style={styles.titleBox}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_to}
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                            </View>
                            <AppText
                                title={recipient}
                                variant={TextVariantKeys.titleSmall}
                                textColor={
                                    theme.colors.text_on_surface_text_high
                                }
                            />
                        </View>
                    </View>

                    <View style={styles.mt30}>
                        <View
                            style={[
                                styles.alignItemsCenter,
                                styles.justifyContentBetween,
                                styles.flexRow,
                            ]}>
                            <AppText
                                titleWithI18n={
                                    LanguageKey.send_service_fee_title
                                }
                                variant={TextVariantKeys.bodyMMedium}
                                textColor={
                                    theme.colors.text_on_surface_text_light
                                }
                            />

                            <AppText
                                title={serviceFee}
                                variant={TextVariantKeys.titleSmall}
                                textColor={
                                    theme.colors.text_on_surface_text_high
                                }
                                styles={appStyles.textAlignRight}
                            />
                        </View>
                        <View
                            style={[
                                styles.alignItemsCenter,
                                styles.justifyContentBetween,
                                styles.flexRow,
                                styles.mt20,
                                styles.totalAmount,
                            ]}>
                            <AppText
                                titleWithI18n={LanguageKey.common_total_amount}
                                variant={TextVariantKeys.bodyMLarge}
                                textColor={
                                    theme.colors.text_on_surface_text_medium
                                }
                            />

                            <AppText
                                title={totalAmount}
                                variant={TextVariantKeys.titleMedium}
                                textColor={
                                    theme.colors.text_on_surface_text_high
                                }
                                styles={appStyles.textAlignRight}
                            />
                        </View>
                        <View
                            style={[
                                styles.alignItemsCenter,
                                styles.justifyContentBetween,
                                styles.flexRow,
                                styles.mt20,
                            ]}>
                            <AppText
                                titleWithI18n={LanguageKey.nft_estimate_gas_fee}
                                variant={TextVariantKeys.bodyMLarge}
                                textColor={
                                    theme.colors.text_on_surface_text_medium
                                }
                            />
                            <AppText
                                title={estimateGas}
                                variant={TextVariantKeys.titleSmall}
                                textColor={
                                    theme.colors.text_on_surface_text_high
                                }
                                styles={appStyles.textAlignRight}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
            {newUI ? (
                <AppButtonSVG
                    onPress={handleConfirm}
                    titleWithI18n={LanguageKey.home_send_title}
                    textVariant={TextVariantKeys.bodyMMedium}
                    textColor={appColors.neutral.white}
                    styles={[styles.button, appStyles.mh25]}
                    isLoading={isLoading}
                    SvgView={SvgView.button}
                />
            ) : (
                <AppButton
                    onPress={handleConfirm}
                    titleWithI18n={LanguageKey.home_send_title}
                    textVariant={TextVariantKeys.bodyMMedium}
                    textColor={appColors.neutral.white}
                    styles={[styles.button, appStyles.mh25]}
                    isLoading={isLoading}
                />
            )}
        </View>
    );
};

export { BottomSheetContentConfirmation, GivePermissionSpendToken };
