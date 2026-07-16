import React, { useRef } from 'react';
import {
    Edit2SvgIcon,
    MoreSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { Image, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { AccountType } from 'src/core/redux/slice/account.type';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import appColors from 'src/core/constants/AppColors';
import AppText from './AppText';

type WalletBottomSheetType = {
    buttonRefs: React.MutableRefObject<{
        [key: string]: TouchableOpacity | null;
    }>;
    onSelectWalletItem: (item: AccountType) => void;
    onShowMenuWallet: (item: AccountType, index: number) => void;
    currentWallet?: AccountType;
    walletData: AccountType[];
    editMainWallet?: (
        ref: React.MutableRefObject<TouchableOpacity | null>,
    ) => void;
};

const HeaderWalletBottomSheet: React.FC<WalletBottomSheetType> = ({
    buttonRefs,
    onSelectWalletItem,
    onShowMenuWallet,
    currentWallet,
    walletData,
    editMainWallet,
}) => {
    const theme: AppThemeType = useAppTheme();
    const styles = useStyles(theme);
    const mainWalletButtonRef = useRef<TouchableOpacity | null>(null);

    const renderItem = ({
        item,
        index,
    }: {
        item: AccountType;
        index: number;
    }) => {
        const isFirstItem = index === 0;
        const isLastItem = index === walletData.length - 1;
        const isOnlyOneItem = (isFirstItem === isLastItem) === true;

        return (
            <TouchableOpacity
                onPress={() => onSelectWalletItem(item)}
                style={[
                    appStyles.flexRow,
                    appStyles.alignItemsCenter,
                    appStyles.justifyContentBetween,
                    styles.walletItemContainer,
                    isOnlyOneItem && styles.walletItemOnlyOneItem,
                    isFirstItem && styles.walletItemFirstItem,
                    isLastItem && styles.walletLastFirstItem,
                ]}>
                <View style={[styles.walletIcon3, appStyles.ml15]}>
                    <Image
                        source={appImages.aiLogo}
                        style={{ width: 28, height: 28, borderRadius: 14 }}
                    />
                </View>
                <View style={[appStyles.flex1, appStyles.pL15]}>
                    <AppText
                        title={item.name}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_high}
                        numberOfLines={1}
                    />
                </View>
                <TouchableOpacity
                    style={styles.walletOption}
                    ref={ref => (buttonRefs.current[index.toString()] = ref)}
                    onPress={() => onShowMenuWallet(item, index)}>
                    <MoreSvgIcon />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };
    return (
        <View style={appStyles.mh25}>
            <View style={appStyles.alignItemsCenter}>
                <TouchableOpacity
                    style={styles.walletIcon2}
                    ref={mainWalletButtonRef}
                    onPress={() =>
                        editMainWallet
                            ? editMainWallet(mainWalletButtonRef)
                            : null
                    }>
                    <Image
                        source={appImages.aiLogo}
                        style={{ width: 44, height: 44, borderRadius: 22 }}
                    />
                    <View style={styles.mainWalletEdit}>
                        <Edit2SvgIcon />
                    </View>
                </TouchableOpacity>
                <View style={appStyles.mt10}>
                    <AppText
                        title={currentWallet?.name ?? ''}
                        numberOfLines={1}
                        variant={TextVariantKeys.titleSmall}
                        textColor={theme.colors.text_on_surface_text_light}
                    />
                </View>
            </View>
            <View style={appStyles.mt25}>
                <AppText
                    titleWithI18n={LanguageKey.account_title}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={theme.colors.text_on_surface_text_medium}
                    styles={appStyles.pB15}
                />
                <FlatList
                    bounces={false}
                    data={walletData}
                    renderItem={renderItem}
                />
            </View>
        </View>
    );
};

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        walletOption: {
            height: 64,
            ...appStyles.center,
            ...appStyles.pd15,
        },
        mainWalletEdit: {
            position: 'absolute',
            width: 44,
            height: 44,
            top: -4,
            right: -4,
            alignItems: 'flex-end',
        },
        walletItemOnlyOneItem: {
            borderRadius: 4,
        },

        walletItemFirstItem: {
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
        },
        walletLastFirstItem: {
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
        },
        walletItemContainer: {
            backgroundColor: theme.colors.surface_surface_high,
            borderWidth: 0.5,
            borderColor: theme.colors.outline_outine_lightest,
            height: 64,
        },
        walletIcon3: {
            ...appStyles.center,
            width: 32,
            height: 32,
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 100,
            shadowColor: appColors.neutral.n300,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 6,
        },
        walletIcon2: {
            width: 44,
            height: 44,
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 100,
            ...appStyles.center,
            shadowColor: appColors.neutral.n300,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
        },
    });

export default HeaderWalletBottomSheet;
