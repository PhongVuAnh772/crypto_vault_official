import React from 'react';
import { View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import PinCodeInput from 'src/components/common/PinCodeInput';
import appColors from 'src/core/constants/AppColors';
import { WarnSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import usePinCode from 'src/features/auth/pinCode/pinCode.hook';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useStyles from './pincode.style';

const PinCode: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        showIncorrectPinModal,
        setShowIncorrectPinModal,
        pinCode,
        setPinCode,
        theme,
        newUI,
    } = usePinCode({ navigation });
    const style = useStyles(theme);
    return (
        <ScreenWrapper
            enableDismissKeyboard
            enableHeader
            paddingTop
            headerTitleWithI18n={LanguageKey.create_pin_title}
            headerTextVariant={TextVariantKeys.titleLarge}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}>
            <AppModal
                visible={showIncorrectPinModal}
                onPress={() => {
                    setShowIncorrectPinModal(!showIncorrectPinModal);
                }}
                titleWithI18n={LanguageKey.restore_error_title}
                subTitleWithI18n={LanguageKey.restore_error_sub_title}
                buttonTitleWithI18n={LanguageKey.common_text_try_again}
                icon={<WarnSvgIcon />}
            />
            <View style={newUI ? style.newContainer : style.container}>
                <View style={[appStyles.alignItemsCenter]}>
                    <View style={[appStyles.mt55, appStyles.center]}>
                        <View style={appStyles.pB15}>
                            <AppText
                                titleWithI18n={LanguageKey.pin_input_title}
                                variant={TextVariantKeys.bodyRLarge}
                                textColor={
                                    theme.colors.text_on_surface_text_medium
                                }
                            />
                        </View>
                        <PinCodeInput value={pinCode} setValue={setPinCode} />
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default PinCode;
