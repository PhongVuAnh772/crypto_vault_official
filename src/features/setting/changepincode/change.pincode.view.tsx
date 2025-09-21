import React from 'react';
import { View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import PinCodeInput from 'src/components/common/PinCodeInput';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import appColors from 'src/core/constants/AppColors';
import { ToastSuccessSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useChangePinCode from './change.pincode.hook';
import useStyles from './change.pincode.style';

const ChangePincodeScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        theme,
        isNewPin,
        showModalChangePinCodeSuccess,
        backAction,
        checkOldPinCode,
        checkOldPinCodeDone,
        code,
        onChangeCode,
        incorrectPin,
        customRef,
        onModalChangePinCodeSuccessDismiss,
        closeModalChangePinCodeSuccess,
        newUI,
    } = useChangePinCode({
        navigation,
    });
    const styles = useStyles(theme);
    return (
        <ScreenWrapper
            enableDismissKeyboard
            enableHeader
            paddingTop
            headerTitleWithI18n={
                isNewPin
                    ? LanguageKey.create_pin_title
                    : LanguageKey.re_enter_pin_title
            }
            backAction={backAction}
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }>
            <RequirePinCodeLayout
                visible={checkOldPinCode}
                onClose={backAction}
                headerTitle={LanguageKey.change_pin_code_old_pin_title}
                continueActionAfterPassPinCode={checkOldPinCodeDone}
                disableFaceId
            />
            {!checkOldPinCode && (
                <View style={styles.boxPinCode}>
                    <View style={appStyles.mbt15}>
                        <AppText
                            titleWithI18n={LanguageKey.pin_input_title}
                            variant={TextVariantKeys.bodyRLarge}
                            styles={appStyles.textAlignCenter}
                            textColor={theme.colors.text_on_surface_text_medium}
                        />
                    </View>
                    <PinCodeInput
                        customRef={customRef}
                        value={code}
                        setValue={onChangeCode}
                        error={incorrectPin}
                        customError={
                            isNewPin
                                ? LanguageKey.change_pin_code_error
                                : undefined
                        }
                    />
                </View>
            )}
            <AppModal
                visible={showModalChangePinCodeSuccess}
                onPress={closeModalChangePinCodeSuccess}
                onDismiss={onModalChangePinCodeSuccessDismiss}
                titleWithI18n={LanguageKey.changed_success_title}
                subTitleWithI18n={LanguageKey.your_pin_code_changed_success}
                buttonTitleWithI18n={LanguageKey.common_text_ok}
                icon={<ToastSuccessSvgIcon />}
            />
        </ScreenWrapper>
    );
};

export default ChangePincodeScreen;
