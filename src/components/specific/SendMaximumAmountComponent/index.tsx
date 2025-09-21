import React from 'react';
import { View } from 'react-native';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { FeeSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';
import useStyles from './styles';

const SendMaximumAmountComponent = ({
    onPress,
    title,
    subTitle,
}: {
    onPress: () => void;
    title?: string;
    subTitle?: string;
}) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    return (
        <View style={[appStyles.mt30, appStyles.flex1, appStyles.mbt15]}>
            <View
                style={[
                    appStyles.flex1,
                    appStyles.alignItemsCenter,
                    styles.pH14,
                ]}>
                <FeeSvgIcon />
                <View style={[appStyles.mbt15, appStyles.mt20]}>
                    <AppText
                        titleWithI18n={
                            title ?? LanguageKey.common_send_maximum_amount
                        }
                        variant={TextVariantKeys.titleLarge}
                        textColor={theme.colors.text_on_surface_text_high}
                    />
                </View>
                <AppText
                    titleWithI18n={
                        subTitle ?? LanguageKey.send_maximum_sub_title
                    }
                    variant={TextVariantKeys.bodyRMedium}
                    textColor={theme.colors.text_on_surface_text_high}
                    styles={styles.textAlignCenter}
                />
            </View>
            <View style={appStyles.pH30}>
                {newUI ? (
                    <AppButtonSVG
                        onPress={onPress}
                        titleWithI18n={LanguageKey.common_understood}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        styles={styles.button}
                        SvgView={SvgView.button}
                    />
                ) : (
                    <AppButton
                        onPress={onPress}
                        titleWithI18n={LanguageKey.common_understood}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        styles={styles.button}
                    />
                )}
            </View>
        </View>
    );
};

export default SendMaximumAmountComponent;
