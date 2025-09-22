import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { Close2SvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';
import styles from './styles';

const UnAddedNFTTabModalHeader: React.FC<{
    title: string;
    closeModal: () => void;
}> = ({ title, closeModal }) => {
    return (
        <View style={[appStyles.mh25]}>
            <View style={[appStyles.flexRow, appStyles.pB15]}>
                <View style={[appStyles.center, appStyles.flex1]}>
                    <AppText
                        titleWithI18n={title}
                        variant={TextVariantKeys.titleLarge}
                        textColor={appColors.neutral.black}
                    />
                </View>
                <View style={[styles.closeContainer, appStyles.flex1]}>
                    <TouchableOpacity
                        onPress={closeModal}
                        style={styles.closeButton}>
                        <Close2SvgIcon style={styles.icon_color} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default UnAddedNFTTabModalHeader;
