import React from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import AppText from 'src/components/common/AppText';
import { MoreSvgIcon, WalletLogoSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { AddressListItemType } from 'src/core/redux/slice/account.type';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import WalletUtils from 'src/core/utils/walletUtils';
import useStyles from './style';

type WalletItemType = {
    item: AddressListItemType;
    onPress?: (value: AddressListItemType) => void;
    theme: AppThemeType;
    styles?: StyleProp<ViewStyle>;
    isSelected?: boolean;
    buttonRefs?: React.MutableRefObject<{
        [key: string]: TouchableOpacity | null;
    }>;
    index: number;
    onShowMenuWallet?: (item: AddressListItemType, index: number) => void;
};
const WalletItem = ({
    onPress,
    theme,
    item,
    styles,
    isSelected = false,
    buttonRefs,
    index,
    onShowMenuWallet,
}: WalletItemType) => {
    const style = useStyles(theme);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
                if (onPress) {
                    onPress(item);
                }
            }}
            style={[
                style.flexRow,
                style.justifyContentBetween,
                style.alignItemsCenter,
                style.listProtocolItem,
                styles,
                isSelected ? style.walletSelected : null,
            ]}>
            <View style={[style.walletIcon3]}>
                <WalletLogoSvgIcon
                    width={20}
                    height={15}
                    color={item.avtColor}
                />
            </View>
            <View style={appStyles.flex1}>
                <AppText
                    title={item.name}
                    numberOfLines={1}
                    variant={TextVariantKeys.bodyMMedium}
                    styles={style.nameProtocol}
                    textColor={theme.colors.text_on_surface_text_high}
                />
                <AppText
                    title={WalletUtils.getShortAddress(item.address)}
                    variant={TextVariantKeys.bodyMSmall}
                    styles={style.nameProtocol}
                    textColor={theme.colors.text_on_surface_text_light}
                />
            </View>
            {onShowMenuWallet && (
                <TouchableOpacity
                    style={style.walletOption}
                    ref={ref =>
                        buttonRefs
                            ? (buttonRefs.current[index.toString()] = ref)
                            : {}
                    }
                    onPress={() => onShowMenuWallet(item, index)}>
                    <MoreSvgIcon />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

export default WalletItem;
