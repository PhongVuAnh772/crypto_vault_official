import React from 'react';
import { View } from 'react-native';
import AppText from 'src/components/common/AppText';
import { CoinRezPointSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { PointExpirationInfo } from 'src/core/redux/slice/rezPoint/rezPoint.type';
import appStyles from 'src/core/styles';
import { rezPointUtils } from 'src/core/utils/rezPoint';
import { useStyles } from './styles';

export const PointExpiryDateItem: React.FC<PointExpirationInfo> = ({
    pointExpired,
    expiredDate,
}) => {
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const styles = useStyles(theme, insets);

    return (
        <View style={[appStyles.fullWidth, styles.pointExpiryDateItem]}>
            <CoinRezPointSvgIcon />
            <View style={[appStyles.flex1, styles.pointExpiryDateItemText]}>
                <View style={[appStyles.justifyContentCenter, appStyles.flex1]}>
                    <AppText
                        title={`${rezPointUtils.formatCurrency(pointExpired)} REZ`}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_high}
                        maxFontSizeMultiplier={1.4}
                        styles={styles.itemTextTop}
                    />
                </View>
                <View style={appStyles.flex1}>
                    <AppText
                        title={expiredDate + ''}
                        variant={TextVariantKeys.bodyRSmall}
                        textColor={theme.colors.text_on_surface_text_lightest}
                        maxFontSizeMultiplier={1.4}
                        styles={[
                            styles.itemTextBottom,
                            appStyles.textAlignRight,
                        ]}
                    />
                </View>
            </View>
        </View>
    );
};
