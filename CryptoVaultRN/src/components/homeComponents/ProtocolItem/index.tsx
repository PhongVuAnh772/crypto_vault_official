import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LoadingImage } from 'src/components/common/AppImage/type';
import ProtocolImage from 'src/components/specific/ProtocolImage';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';
import { AppThemeType } from 'src/core/type/ThemeType';
import protocolItemStyle from './style';
import { Feather } from '@expo/vector-icons';

type ProtocolType = {
    item: ProtocolDataWithSupportedTokensFormBEType;
    selected?: boolean | null;
    onPress?: (value: ProtocolDataWithSupportedTokensFormBEType) => void;
    setLoadingImages: (uri: string, value: boolean) => void;
    isLoadingImage: LoadingImage;
    theme: AppThemeType;
};

const getProtocolSubtitle = (symbol: string) => {
    const sym = symbol?.toUpperCase();
    switch (sym) {
        case 'BTC':
            return 'Mạng lưới Bitcoin';
        case 'BSC':
        case 'BNB':
            return 'Binance Smart Chain';
        case 'ETH':
            return 'Mạng lưới Ethereum';
        case 'POLYGON':
        case 'POL':
        case 'MATIC':
            return 'Mạng lưới Polygon';
        case 'TON':
            return 'The Open Network';
        default:
            return `Mạng lưới ${symbol}`;
    }
};

const ProtocolItem = ({
    selected,
    isLoadingImage,
    onPress,
    theme,
    item,
    setLoadingImages,
}: ProtocolType) => {
    const styles = protocolItemStyle;
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
                if (onPress) {
                    onPress(item);
                }
            }}
            style={[
                styles.card,
                selected ? styles.selectedCard : styles.unselectedCard
            ]}
        >
            <View style={styles.cardContent}>
                {/* Left side: Icon */}
                <View style={styles.iconContainer}>
                    <ProtocolImage
                        slip0044={item.slip0044}
                        size={40}
                        bonusId={item._id}
                        isLoadingImage={
                            isLoadingImage[item.logo + item._id]?.loading
                        }
                        logoUri={item.logo}
                        setLoadingImages={setLoadingImages}
                    />
                </View>

                {/* Center: Name, symbol and description */}
                <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.protocolName}>{item.name}</Text>
                        <View style={styles.symbolBadge}>
                            <Text style={styles.symbolText}>{item.symbol}</Text>
                        </View>
                    </View>
                    <Text style={styles.protocolDesc}>
                        {getProtocolSubtitle(item.symbol)}
                    </Text>
                </View>

                {/* Right side: Radio check indicator */}
                <View style={styles.rightContainer}>
                    {selected ? (
                        <View style={styles.checkedCircle}>
                            <Feather name="check" size={14} color="#FFFFFF" />
                        </View>
                    ) : (
                        <View style={styles.uncheckedCircle} />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default ProtocolItem;
