import React from 'react';
import { Image, FlatList, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { AccountType } from 'src/core/redux/slice/account.type';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import AppText from './AppText';
import { Feather } from '@expo/vector-icons';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import WalletAddressModal from './WalletAddressModal';

type WalletBottomSheetType = {
    onSelectWalletItem: (item: AccountType) => void;
    currentWallet?: AccountType;
    walletData: AccountType[];
    onSwipeEdit: (item: AccountType) => void;
    onSwipeRemove: (item: AccountType) => void;
    onPressAdd?: () => void;
};

const HeaderWalletBottomSheet: React.FC<WalletBottomSheetType> = ({
    onSelectWalletItem,
    currentWallet,
    walletData,
    onSwipeEdit,
    onSwipeRemove,
    onPressAdd,
}) => {
    const theme: AppThemeType = useAppTheme();
    const styles = useStyles(theme);
    const insets = useAppSafeAreaInsets();

    const [addressModalData, setAddressModalData] = React.useState<{ address: string; name: string } | null>(null);

    const getAccountAddress = (acc?: AccountType) => {
        if (!acc) return '';
        const firstProtocol = acc.protocolData?.find(p => p.addressList && p.addressList.length > 0) || acc.protocolData?.[0];
        const firstAddress = firstProtocol?.addressList?.[0];
        if (!firstAddress) return '';
        const addr = firstAddress.address;
        if (addr.length > 16) {
            return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
        }
        return addr;
    };

    const getFullAccountAddress = (acc?: AccountType) => {
        if (!acc) return '';
        const firstProtocol = acc.protocolData?.find(p => p.addressList && p.addressList.length > 0) || acc.protocolData?.[0];
        const firstAddress = firstProtocol?.addressList?.[0];
        return firstAddress?.address || '';
    };

    const renderRightActions = (item: AccountType, isCurrent: boolean = false) => {
        return (
            <View style={[styles.swipeActionsContainer, { marginBottom: isCurrent ? 10 : 8 }]}>
                <TouchableOpacity
                    onPress={() => onSwipeEdit(item)}
                    style={[styles.swipeButton, styles.editSwipeButton]}
                >
                    <Feather name="edit-2" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onSwipeRemove(item)}
                    style={[styles.swipeButton, styles.deleteSwipeButton]}
                >
                    <Feather name="trash-2" size={16} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderItem = ({
        item,
    }: {
        item: AccountType;
        index: number;
    }) => {
        return (
            <Swipeable
                key={item.id}
                overshootRight={false}
                renderRightActions={() => renderRightActions(item, false)}
            >
                <View style={styles.otherWalletCard}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => onSelectWalletItem(item)}
                        style={styles.walletRow}
                    >
                        <View style={styles.walletIconWrapper}>
                            <Image
                                source={appImages.aiLogo}
                                style={styles.walletAvatar}
                            />
                        </View>
                        <View style={appStyles.flex1}>
                            <AppText
                                title={item.name}
                                variant={TextVariantKeys.bodyMMedium}
                                textColor="#1A1C36"
                                styles={styles.walletName}
                            />
                            <TouchableOpacity
                                onPress={() => setAddressModalData({
                                    address: getFullAccountAddress(item),
                                    name: item.name,
                                })}
                            >
                                <AppText
                                    title={getAccountAddress(item)}
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor="#7D859A"
                                    styles={styles.walletAddress}
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>
            </Swipeable>
        );
    };

    return (
        <View style={[styles.mainWrapper, { paddingBottom: insets.bottom + 20 }]}>
            {/* Sheet Title */}
            <AppText
                title="Tài khoản của bạn"
                variant={TextVariantKeys.titleLarge}
                textColor="#1A1C36"
                styles={styles.sheetTitle}
            />

            {/* Current Account Section */}
            <AppText
                title="Tài khoản hiện tại"
                variant={TextVariantKeys.bodyMSmall}
                textColor="#7D859A"
                styles={styles.sectionHeader}
            />

            {/* Render Current Wallet Item */}
            {currentWallet ? (
                <Swipeable
                    overshootRight={false}
                    renderRightActions={() => renderRightActions(currentWallet, true)}
                >
                    <View style={styles.currentWalletCard}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => onSelectWalletItem(currentWallet)}
                            style={styles.walletRow}
                        >
                            <View style={styles.walletIconWrapper}>
                                <Image
                                    source={appImages.aiLogo}
                                    style={styles.walletAvatar}
                                />
                            </View>
                            <View style={appStyles.flex1}>
                                <AppText
                                    title={currentWallet.name}
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor="#1A1C36"
                                    styles={styles.walletName}
                                />
                                <TouchableOpacity
                                    onPress={() => setAddressModalData({
                                        address: getFullAccountAddress(currentWallet),
                                        name: currentWallet.name,
                                    })}
                                >
                                    <AppText
                                        title={getAccountAddress(currentWallet)}
                                        variant={TextVariantKeys.bodyMSmall}
                                        textColor="#7D859A"
                                        styles={styles.walletAddress}
                                    />
                                </TouchableOpacity>
                            </View>
                            {/* Purple checkmark icon */}
                            <View style={styles.checkmarkCircle}>
                                <Feather name="check" size={12} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </Swipeable>
            ) : null}

            {/* Other Accounts Section */}
            <AppText
                title="Tài khoản khác"
                variant={TextVariantKeys.bodyMSmall}
                textColor="#7D859A"
                styles={styles.sectionHeader}
            />

            {walletData.length === 0 ? (
                /* Empty state with dashed border */
                <View style={styles.dashedContainer}>
                    <Image
                        source={appImages.walletIllustration}
                        style={styles.illustrationImage}
                        resizeMode="contain"
                    />
                    <AppText
                        title="Chưa có tài khoản nào"
                        variant={TextVariantKeys.titleMedium}
                        textColor="#1A1C36"
                        styles={styles.emptyTitle}
                    />
                    <AppText
                        title={"Thêm hoặc tạo tài khoản mới\nđể bắt đầu quản lý tài sản của bạn."}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor="#7D859A"
                        styles={styles.emptySubtitle}
                    />
                </View>
            ) : (
                /* List of other wallets */
                <FlatList
                    bounces={false}
                    data={walletData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                />
            )}

            {/* Add account button at the bottom */}
            {onPressAdd && (
                <TouchableOpacity
                    onPress={onPressAdd}
                    activeOpacity={0.8}
                    style={styles.addAccountBtn}
                >
                    <View style={styles.addAccountBtnContent}>
                        <View style={styles.plusIconBg}>
                            <Feather name="plus" size={14} color="#7C3AED" />
                        </View>
                        <Text style={styles.addAccountBtnText}>Thêm tài khoản khác</Text>
                    </View>
                </TouchableOpacity>
            )}

            <WalletAddressModal
                visible={!!addressModalData}
                onClose={() => setAddressModalData(null)}
                address={addressModalData?.address || ''}
                walletName={addressModalData?.name || 'Ví của bạn'}
            />
        </View>
    );
};

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        otherWalletCard: {
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: 'rgba(124, 58, 237, 0.05)',
            padding: 14,
        },
        mainWrapper: {
            paddingHorizontal: 20,
            paddingTop: 10,
            backgroundColor: '#F5F6FC', // Premium light lilac background matching mockup
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            marginTop: -32, // Offset the padding top of childrenView
            paddingTop: 32, // Restore padding top
            height: '100%',
        },
        sheetTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: '#1A1C36',
            marginTop: 10,
            marginBottom: 8,
        },
        sectionHeader: {
            fontSize: 13,
            fontWeight: '600',
            color: '#7D859A',
            marginTop: 14,
            marginBottom: 8,
        },
        currentWalletCard: {
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: 'rgba(124, 58, 237, 0.05)',
            shadowColor: '#7C3AED',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
            marginBottom: 10,
        },
        walletRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        walletIconWrapper: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#1E1A4A',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        walletAvatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
        },
        walletName: {
            fontSize: 15,
            fontWeight: '700',
            color: '#1A1C36',
            marginBottom: 2,
            marginLeft: 0, // Reset
        },
        walletAddress: {
            fontSize: 12,
            color: '#7D859A',
            marginLeft: 0, // Reset
        },
        checkmarkCircle: {
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#6A56FD',
            justifyContent: 'center',
            alignItems: 'center',
        },
        dashedContainer: {
            borderStyle: 'dashed',
            borderWidth: 1.5,
            borderColor: '#C3C5F1',
            borderRadius: 20,
            paddingVertical: 24,
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            marginVertical: 10,
        },
        illustrationImage: {
            width: 100,
            height: 100,
            marginBottom: 16,
        },
        emptyTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: '#1A1C36',
            marginBottom: 6,
            textAlign: 'center',
        },
        emptySubtitle: {
            fontSize: 12,
            color: '#7D859A',
            textAlign: 'center',
            lineHeight: 18,
        },
        addAccountBtn: {
            backgroundColor: '#7C3AED',
            borderRadius: 20,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
        },
        addAccountBtnContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        plusIconBg: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
        },
        addAccountBtnText: {
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: '700',
        },
        swipeActionsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: 120,
            paddingLeft: 8,
        },
        swipeButton: {
            width: 48,
            height: 48,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 8,
        },
        editSwipeButton: {
            backgroundColor: '#6A56FD',
        },
        deleteSwipeButton: {
            backgroundColor: '#FF3B30',
        },
    });

export default HeaderWalletBottomSheet;
