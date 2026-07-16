import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import AppText from 'src/components/common/AppText';
import ProtocolImage from 'src/components/specific/ProtocolImage';
import Slip0044 from 'src/core/enum/Slip0044';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import appStyles from 'src/core/styles';
import useStyles from './styles';
import { AppThemeType } from 'src/core/type/ThemeType';

type CryptoButtonType = {
    title?: string;
    symbol?: string;
    logoUri?: string | null;
    balanceString?: string;
    baseRateFiatString?: string;
    balanceToCurrencyString?: string;
    onPress?: () => void;
    isDefaultData?: boolean;
    slip0044?: Slip0044;
    decimals?: number;
};

const CryptoButton: React.FC<CryptoButtonType> = ({
    symbol,
    balanceString,
    onPress,
    logoUri,
    title,
    isDefaultData,
    slip0044,
    decimals,
    baseRateFiatString,
    balanceToCurrencyString,
}) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.itemContainer}
        >
            <View style={styles.iconWrapper}>
                <ProtocolImage
                    isDefaultData={isDefaultData}
                    slip0044={slip0044}
                    size={44}
                    logoUri={logoUri}
                />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{title || 'To Marvilo'}</Text>
                <Text style={styles.itemSub}>29 Feb, 20:37 · {symbol || 'UIScreens'}</Text>
                <Text style={styles.itemStatus}>Completed</Text>
            </View>
            <View style={styles.amountInfo}>
                <Text style={styles.itemAmount}>{balanceToCurrencyString || '0,00 €'}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default CryptoButton;
