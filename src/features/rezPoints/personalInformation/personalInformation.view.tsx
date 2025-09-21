import React from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppLogoLoadingAnimation from 'src/components/common/AppLogoLoadingAnimation';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import AppTextInput from 'src/components/common/AppTextInput';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import appColors from 'src/core/constants/AppColors';
import {
    DangerSvgIcon,
    MenuDotSvgIcon,
    Remove2SvgIcon,
    TrashSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { RezPointOptions } from '../home/homeRezPoints.component';
import usePersonalInformation from './personalInformation.hook';
import { useStyles } from './personalInformation.style';

const PersonalInformation: React.FC<RootNavigationType> = ({ navigation }) => {
    const { t } = useTranslation();
    const theme = useAppTheme();
    const styles = useStyles(theme);
    const {
        getInfoUser,
        onShowBottomSheetMenu,
        bottomSheetRefMenu,
        onShowModalDeleteAccount,
        onShowConfirmDeleteAccount,
        onHideModalDeleteAccount,
        onCloseModalConfirmDeleteAccount,
        modalDeleteAccount,
        handleDeleteAccount,
        isLoading,
        isEnableButton,
        setConfirmText,
        confirmText,
        newUI,
    } = usePersonalInformation({ navigation });

    return (
        <ScreenWrapper
            paddingTop
            enableHeader
            headerTitleWithI18n={LanguageKey.common_personal_information}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI ? appColors.main.tokyoRed : appColors.neutral.n100
            }
            iconRight={
                <TouchableOpacity onPress={onShowBottomSheetMenu}>
                    <MenuDotSvgIcon
                        color={
                            newUI
                                ? appColors.neutral.white
                                : appColors.neutral.n800
                        }
                        width={20}
                        height={20}
                    />
                </TouchableOpacity>
            }>
            <View style={styles.container}>
                <AppTextInput
                    value={getInfoUser?.name || ''}
                    onChangeText={() => {}}
                    labelName={t(LanguageKey.setting_name)}
                    required
                    styleTextInput={[styles.disableInput, styles.textInput]}
                    editable={false}
                />
                <View style={styles.h16} />
                <AppTextInput
                    value={getInfoUser?.email || ''}
                    onChangeText={() => {}}
                    labelName={t(LanguageKey.setting_email)}
                    required
                    styleTextInput={[styles.disableInput, styles.textInput]}
                    editable={false}
                />
            </View>
            {/* <ButtonBottom onPress={() => {}} title={t(LanguageKey.submit)} /> */}
            <BottomSheetModalGorhom
                refModal={bottomSheetRefMenu}
                snapPoints={['17']}>
                <View
                    style={[
                        appStyles.mh25,
                        appStyles.mt12,
                        styles.bottomSheetContent,
                    ]}>
                    <RezPointOptions
                        icon={<TrashSvgIcon />}
                        titleWithI18n={LanguageKey.rez_point_delete_account}
                        onPress={onShowModalDeleteAccount}
                        textColor={appColors.main.tokyoRed}
                    />
                </View>
            </BottomSheetModalGorhom>
            <AppModal
                titleWithI18n={LanguageKey.rez_point_delete_my_account}
                visible={modalDeleteAccount.deleteAccountModal}
                onPress={onShowConfirmDeleteAccount}
                buttonTitleWithI18n={LanguageKey.rez_point_delete_account}
                onPress2={onHideModalDeleteAccount}
                twoOptions={true}
                buttonTitleWithI18n2={LanguageKey.common_text_cancel}
                icon={<DangerSvgIcon />}
                textButtonSecondColor={
                    theme.colors.text_on_surface_text_brand_2
                }
                buttonSecondContainerStyle={styles.cancelButton}
                enableKeyboard
                buttonDisabled={!isEnableButton}
                childrenContent={
                    <View>
                        <AppText
                            titleWithI18n={
                                LanguageKey.rez_point_delete_my_account_sub_title
                            }
                            variant={TextVariantKeys.bodyRMedium}
                            styles={[
                                appStyles.mbt20,
                                appStyles.textAlignCenter,
                            ]}
                            textColor={theme.colors.text_on_surface_text_high}>
                            <AppText
                                title={` ${t(
                                    LanguageKey.rez_point_delete_my_account_sub_title_3,
                                    {
                                        days: 30,
                                    },
                                )} `}
                                variant={TextVariantKeys.labelMedium}
                                textColor={
                                    theme.colors.text_on_surface_text_high
                                }>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.rez_point_delete_my_account_sub_title_2
                                    }
                                    variant={TextVariantKeys.bodyRMedium}
                                    textColor={
                                        theme.colors.text_on_surface_text_high
                                    }
                                />
                            </AppText>
                        </AppText>
                        <AppText
                            titleWithI18n={
                                LanguageKey.rez_point_delete_my_account_sub_title_4
                            }
                            variant={TextVariantKeys.bodyRMedium}
                            styles={[
                                appStyles.mbt20,
                                appStyles.textAlignCenter,
                            ]}
                            textColor={theme.colors.text_on_surface_text_high}
                        />
                        <View style={appStyles.mbt30}>
                            <AppTextInput
                                textVariant={TextVariantKeys.bodyRMedium}
                                value={confirmText}
                                onChangeText={setConfirmText}
                                labelName={t(
                                    LanguageKey.rez_point_delete_my_account_input_confirm,
                                )}
                                required
                                styleTextInput={styles.textInput}
                                placeholder={t(
                                    LanguageKey.rez_point_delete_my_account_input_confirm,
                                )}
                            />
                        </View>
                    </View>
                }
            />
            <AppModal
                titleWithI18n={LanguageKey.rez_point_delete_account}
                subTitleWithI18n={
                    LanguageKey.rez_point_delete_account_sub_title
                }
                visible={modalDeleteAccount.confirmDeleteAccount}
                onPress={handleDeleteAccount}
                buttonTitleWithI18n={LanguageKey.common_text_confirm}
                onPress2={onCloseModalConfirmDeleteAccount}
                twoOptions={true}
                buttonTitleWithI18n2={LanguageKey.common_text_cancel}
                icon={<Remove2SvgIcon />}
                textButtonSecondColor={
                    theme.colors.text_on_surface_text_brand_2
                }
                buttonSecondContainerStyle={styles.cancelButton}
            />
            <AppLogoLoadingAnimation isLoading={isLoading} />
        </ScreenWrapper>
    );
};

export default PersonalInformation;
