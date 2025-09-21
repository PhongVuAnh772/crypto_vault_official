import React, { useCallback } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import appColors from 'src/core/constants/AppColors';
import {
    BitcoinSvgIcon,
    ReceiveSvgIcon,
    SendSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import { CoinType } from 'src/core/enum/CoinType';
import { UnAddedType } from 'src/core/enum/UnAddedType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import appStyles from 'src/core/styles';

type UnAddedNFTTypeIconType = {
    style?: StyleProp<ViewStyle>;
    type: UnAddedType | null;
    coinType?: CoinType;
    uri?: string;
};

const UnAddedNFTTypeIcon: React.FC<UnAddedNFTTypeIconType> = ({
    style,
    type,
    coinType,
    uri,
}) => {
    const theme = useAppTheme();
    const Icon = useCallback(() => {
        switch (type) {
            case UnAddedType.Archived:
                return (
                    <SendSvgIcon
                        color={theme.colors.text_on_surface_text_high}
                    />
                );
            case UnAddedType.UnArchive:
            case UnAddedType.All:
                return (
                    <ReceiveSvgIcon
                        color={theme.colors.text_on_surface_text_high}
                    />
                );
            default:
                return null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    const CoinIcon = useCallback(() => {
        switch (coinType) {
            case CoinType.Bitcoin:
                return <BitcoinSvgIcon width={13} height={13} />;

            default:
                return (
                    <AppImage
                        uri={uri}
                        defaultImage={appImages.logo}
                        styleImage={appStyles.iconCircleSize13}
                    />
                );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coinType]);
    return (
        <View style={[styles.icon, style]}>
            <Icon />
            {coinType || uri ? (
                <View style={styles.coinIcon}>
                    <CoinIcon />
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    icon: {
        ...appStyles.center,
        width: 32,
        height: 32,
        borderRadius: 4,
        backgroundColor: appColors.neutral.n100,
    },
    coinIcon: {
        width: 13,
        height: 13,
        position: 'absolute',
        bottom: -5,
        right: -5,
    },
});

export default UnAddedNFTTypeIcon;
