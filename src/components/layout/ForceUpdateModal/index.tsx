import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import AppButton from 'src/components/common/AppButton';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import appConstants from 'src/core/constants/AppConstants';
import { WarnSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppSelector } from 'src/core/redux/hooks';
import { getShowForceUpdateModal } from 'src/core/redux/slice/app.slice';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import styles from './styles';

type ForceUpdateModalType = {
    subVisible?: boolean;
};

const ForceUpdateModal: React.FC<ForceUpdateModalType> = ({
    subVisible = true,
}) => {
    const showForceUpdateModal = useAppSelector(getShowForceUpdateModal);

    const onUpdate = () => {
        Linking.openURL(
            Utils.isAndroid
                ? appConstants.google_play_store_url
                : appConstants.app_store_url,
        );
    };
    return showForceUpdateModal && subVisible ? (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.container}>
                <View style={styles.subContainer}>
                    <View style={appStyles.mbt15}>
                        <WarnSvgIcon />
                    </View>
                    <AppText
                        titleWithI18n={LanguageKey.force_update_title}
                        variant={TextVariantKeys.titleLarge}
                        styles={appStyles.textAlignCenter}
                    />
                    <View style={appStyles.mv15}>
                        <AppText
                            titleWithI18n={LanguageKey.force_update_sub_title}
                            variant={TextVariantKeys.bodyRMedium}
                            styles={appStyles.textAlignCenter}
                        />
                    </View>
                    <View style={appStyles.flexRow}>
                        <AppButton
                            onPress={onUpdate}
                            titleWithI18n={LanguageKey.common_text_update}
                            textVariant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.neutral.white}
                            forceStyles={styles.buttonUpdate}
                        />
                    </View>
                </View>
            </View>
        </View>
    ) : null;
};

export default ForceUpdateModal;
