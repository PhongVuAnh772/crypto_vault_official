import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { TransactionSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';
import { SwitchProtocolWarningModalProps } from 'src/features/home/projectDetails/details/projectDetails.type';
import { containerStyles } from './style';

export const SwitchProtocolWarningModal: React.FC<
    SwitchProtocolWarningModalProps
> = ({
    theme,
    visibleModal,
    disableAction,
    acceptAction,
    insets,
    currentFalsingProtocol,
    promisingProtocol,
    projectName,
    isLoading,
    currentIcon,
    expectIcon,
}) => {
    const styles = containerStyles(theme, insets);
    const { t } = useTranslation();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    return (
        <AppModal
            onTouchOutside={disableAction}
            titleWithI18n={LanguageKey.claim_detail_switch_protocol}
            visible={visibleModal}
            onPress2={disableAction}
            buttonTitleWithI18n2={LanguageKey.common_text_cancel}
            onPress={() => acceptAction(promisingProtocol)}
            twoOptions={true}
            buttonTitleWithI18n={
                isLoading ? '' : LanguageKey.common_text_switch_action
            }
            enablePaddingSubTitle
            buttonSecondContainerStyle={
                newUI ? undefined : styles.cancelActionSwitching
            }
            textButtonSecondColor={appColors.main.tokyoRed}
            buttonDisabled={isLoading}
            icon={
                <TransactionSvgIcon
                    color={appColors.main.tokyoRed}
                    width={32}
                    height={32}
                />
            }
            iconButton2={
                isLoading ? (
                    <ActivityIndicator
                        color={theme.colors.backdrop}
                        size="large"
                    />
                ) : null
            }
            footerView={
                <View style={[appStyles.pB20, appStyles.pH10]}>
                    <Text style={appStyles.textAlignCenter}>
                        <AppText
                            titleWithI18n={projectName}
                            variant={TextVariantKeys.bodyRMedium}
                            textColor={theme.colors.text_on_surface_text_high}
                            styles={appStyles.textAlignCenter}
                        />
                        <AppText
                            titleWithI18n={t(
                                LanguageKey.claim_token_switch_protocol_1,
                            )}
                            variant={TextVariantKeys.bodyRMedium}
                            textColor={theme.colors.text_on_surface_text_high}
                            styles={appStyles.textAlignCenter}
                        />
                        {expectIcon}
                        <AppText
                            titleWithI18n={promisingProtocol}
                            variant={TextVariantKeys.bodyMLarge}
                            textColor={appColors.main.tokyoRed}
                            styles={appStyles.textAlignCenter}
                        />
                        <AppText
                            titleWithI18n={
                                LanguageKey.claim_token_switch_protocol_2
                            }
                            variant={TextVariantKeys.bodyRMedium}
                            textColor={theme.colors.text_on_surface_text_high}
                            styles={appStyles.textAlignCenter}
                        />
                        {currentIcon}

                        <AppText
                            titleWithI18n={currentFalsingProtocol}
                            variant={TextVariantKeys.bodyMLarge}
                            textColor={appColors.main.tokyoRed}
                            styles={appStyles.textAlignCenter}
                        />
                    </Text>
                    <Text style={[appStyles.textAlignCenter, appStyles.mt15]}>
                        <AppText
                            titleWithI18n={t(
                                LanguageKey.claim_token_switch_protocol_3,
                            )}
                            variant={TextVariantKeys.bodyRMedium}
                            textColor={theme.colors.text_on_surface_text_high}
                            styles={appStyles.textAlignCenter}
                        />
                        {expectIcon}
                        <AppText
                            titleWithI18n={promisingProtocol}
                            variant={TextVariantKeys.bodyMLarge}
                            textColor={appColors.main.tokyoRed}
                            styles={appStyles.textAlignCenter}
                        />
                        <AppText
                            titleWithI18n={t(
                                LanguageKey.claim_token_switch_protocol_4,
                            )}
                            variant={TextVariantKeys.bodyRMedium}
                            textColor={theme.colors.text_on_surface_text_high}
                            styles={appStyles.textAlignCenter}
                        />
                    </Text>
                </View>
            }
        />
    );
};
