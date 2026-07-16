import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import React, {ReactNode} from 'react';
import appStyles from 'src/core/styles';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appColors from 'src/core/constants/AppColors';

type RiskTextWithIconType = {
    titleWithI18n: string;
    icon: ReactNode;
    textColor?: string;
    style?: StyleProp<ViewStyle>;
};

const RiskTextWithIcon: React.FC<RiskTextWithIconType> = props => {
    const {
        titleWithI18n,
        icon,
        textColor = appColors.neutral.white,
        style,
    } = props;
    return (
        <View style={[appStyles.flexRow, appStyles.alignItemsCenter, style]}>
            <View style={styles.icon}>{icon}</View>
            <AppText
                titleWithI18n={titleWithI18n}
                variant={TextVariantKeys.bodyRMedium}
                textColor={textColor}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    icon: {
        width: 32,
        height: 32,
        ...appStyles.center,
        marginRight: 25,
    },
});

export default RiskTextWithIcon;
