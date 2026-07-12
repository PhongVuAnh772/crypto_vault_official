// @ts-nocheck
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import AppButton from 'src/components/common/AppButton';
import AppModal from 'src/components/common/AppModal';
import AppSeparator from 'src/components/common/AppSeparator';
import AppText from 'src/components/common/AppText';
import WalletItem from 'src/components/homeComponents/WalletItem';
import appColors from 'src/core/constants/AppColors';
import { DeleteTextSvgIcon, PlusSvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import InputMode from 'src/core/enum/InputMode';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import {
    AddressListItemType,
    ProtocolDataWithSupportedTokensFormBEType,
} from 'src/core/redux/slice/account.type';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import VMType from 'src/core/enum/VMType';
import AddWalletView from '../AddWalletView';
import useBottomSheetWallet from './BottomSheetWallet.hook';
import { Feather } from '@expo/vector-icons';

type BottomSheetWalletViewType = {
    isAddView: boolean;
    setIsAddView: React.Dispatch<React.SetStateAction<boolean>>;
    onPressAdd?: () => void;
    addressList: AddressListItemType[] | undefined;
    selectedAddressId: string | undefined;
    handlePressWallet: (data: AddressListItemType) => void;
    protocolBaseData?: ProtocolDataWithSupportedTokensFormBEType;
    onSwipeEdit: (item: AddressListItemType) => void;
    onSwipeRemove: (item: AddressListItemType) => void;
    closeParentBottomSheetModal?: () => void;
};

const BottomSheetWalletView: React.FC<BottomSheetWalletViewType> = ({
    addressList,
    selectedAddressId,
    handlePressWallet,
    onSwipeEdit,
    onSwipeRemove,
    protocolBaseData,
    isAddView,
    setIsAddView,
    onPressAdd,
    closeParentBottomSheetModal,
}) => {
    const {
        t,
        theme,
        insets,
        showModalImportWallet,
        isScanning,
        handleCancelScan,
        handleStartScan,
        setShowModalImportWallet,
        walletAddress,
        walletAddressError,
        flatListRef,
        onChangeText,
        createWalletAction,
        handleCopyToClipboard,
        isFocus,
        onFoCus,
        onBlur,
        closeModalImport,
        lightMode,
    } = useBottomSheetWallet({
        addressList,
        selectedAddressId,
        protocolBaseData,
        isAddView,
        setIsAddView,
        closeParentBottomSheetModal,
    });
    const styles = useStyles(theme);
    const currentWallet = addressList?.find(item => item.id === selectedAddressId);
    const otherWallets = addressList?.filter(item => item.id !== selectedAddressId) || [];

    const renderRightActions = (item: AddressListItemType, isCurrent: boolean = false) => {
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

    return isAddView ? (
        <View>
            <AppModal
                visible={showModalImportWallet}
                onPress={isScanning ? handleCancelScan : handleStartScan}
                onTouchOutside={closeModalImport}
                onPress2={isScanning ? handleCancelScan : closeModalImport}
                twoOptions
                footerView={
                    <View style={[styles.modalContainer]}>
                        <AppText
                            titleWithI18n={
                                LanguageKey.exit_wallet_address_title
                            }
                            variant={TextVariantKeys.titleLarge}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                        />

                        <View
                            style={[
                                styles.view_inputAddress,
                                walletAddressError ? styles.walletError : null,
                            ]}>
                            <View style={appStyles.flex1}>
                                <TextInput
                                    disabled={isScanning}
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    autoComplete="off"
                                    importantForAutofill="no"
                                    keyboardType={
                                        Utils.isAndroid
                                            ? 'visible-password'
                                            : 'default'
                                    }
                                    spellCheck={false}
                                    autoFocus={true}
                                    multiline={false}
                                    numberOfLines={1}
                                    value={
                                        isFocus && walletAddress?.length > 20
                                            ? WalletUtils.getShortAddress(
                                                  walletAddress,
                                              )
                                            : walletAddress
                                    }
                                    onChangeText={onChangeText}
                                    placeholder={t(
                                        LanguageKey.enter_wallet_address_title,
                                    )}
                                    placeholderTextColor={
                                        appColors.neutral.n500
                                    }
                                    mode={InputMode.outlined}
                                    outlineColor={
                                        theme.colors.surface_surface_high
                                    }
                                    activeOutlineColor={
                                        theme.colors.surface_surface_high
                                    }
                                    selectionColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                    cursorColor={appColors.neutral.black}
                                    textColor={
                                        theme.colors.text_on_surface_text_high
                                    }
                                    style={[
                                        styles.editInputStyle,
                                        theme.fonts.bodyMMedium,
                                    ]}
                                    onBlur={onBlur}
                                    onFocus={onFoCus}
                                    contentStyle={[styles.editInputStyle2]}
                                />
                            </View>
                            <View style={[appStyles.flexRow, appStyles.center]}>
                                {walletAddress.length > 0 && !isScanning && (
                                    <TouchableOpacity
                                        onPress={() => onChangeText('')}>
                                        <DeleteTextSvgIcon />
                                    </TouchableOpacity>
                                )}
                                <AppButton
                                    onPress={handleCopyToClipboard}
                                    disabled={isScanning}
                                    disabledBackgroundColor={'transparent'}
                                    disabledTextColor={
                                        theme.colors.label_surface_disable
                                    }
                                    titleWithI18n={
                                        LanguageKey.common_text_paste
                                    }
                                    textVariant={TextVariantKeys.bodyMMedium}
                                    textColor={appColors.main.tokyoRed}
                                />
                            </View>
                        </View>
                        {walletAddressError ? (
                            <View style={[appStyles.flexRow]}>
                                <AppText
                                    titleWithI18n={walletAddressError}
                                    textColor={
                                        theme.colors.surface_surface_brand
                                    }
                                />
                            </View>
                        ) : null}
                        {isScanning && (
                            <AppText
                                title={` ${t(LanguageKey.common_scanning)}...`}
                                textColor={appColors.main.tokyoRed}
                            />
                        )}
                    </View>
                }
                buttonDisabled={!walletAddress || isScanning}
                buttonTitleWithI18n={LanguageKey.add_wallet_title}
                buttonTitleWithI18n2={LanguageKey.cancel}
                textButtonSecondColor={
                    theme.colors.text_on_surface_text_brand_2
                }
                buttonSecondContainerStyle={styles.cancelButton}
            />
            <AddWalletView
                typeWallet
                onClose={() => {
                    setIsAddView(false);
                }}
                onCreate={createWalletAction}
                onRestore={() => {
                    setShowModalImportWallet(true);
                }}
            />
        </View>
    ) : (
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
                            onPress={() => handlePressWallet(currentWallet)}
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
                                <AppText
                                    title={WalletUtils.getShortAddress(currentWallet.address)}
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor="#7D859A"
                                    styles={styles.walletAddress}
                                />
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

            {otherWallets.length === 0 ? (
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
                    ref={flatListRef}
                    data={otherWallets}
                    bounces={false}
                    keyExtractor={item => item.id}
                    renderItem={({ item, index }) => (
                        <Swipeable
                            key={item.id}
                            overshootRight={false}
                            renderRightActions={() => renderRightActions(item, false)}
                        >
                            <View style={styles.otherWalletCard}>
                                <WalletItem
                                    item={item}
                                    onPress={handlePressWallet}
                                    theme={theme}
                                    isSelected={false}
                                    index={index}
                                />
                            </View>
                        </Swipeable>
                    )}
                    indicatorStyle={lightMode ? 'white' : 'black'}
                    ItemSeparatorComponent={AppSeparator}
                    onScrollToIndexFailed={info => {
                        setTimeout(() => {
                            flatListRef.current?.scrollToIndex({
                                index: info.index,
                                animated: true,
                            });
                        }, 500);
                    }}
                />
            )}

            {/* Add account button at the bottom */}
            {protocolBaseData?.VM !== VMType.Bitcoin && protocolBaseData?.VM !== VMType.Ton && (
                <TouchableOpacity
                    onPress={() => (onPressAdd ? onPressAdd() : setIsAddView(true))}
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
        </View>
    );
};

export default BottomSheetWalletView;

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        buttonConfirm: {
            ...appStyles.center,
            flex: 1,
        },
        buttonConfirm2: {
            ...appStyles.center,
            backgroundColor: appColors.main.tokyoRed,
            flex: 1,
            ...appStyles.mv20,
        },
        iconClose2: {
            color: theme.colors.text_on_surface_text_high,
        },
        closeButton: {
            width: 24,
            height: 24,
            ...appStyles.center,
        },

        modalContainer: {
            ...appStyles.center,
            borderRadius: 4,
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.pV15,
        },
        editInputStyle: {
            backgroundColor: theme.colors.surface_surface_high,
            minHeight: 40,
            maxHeight: 40,
        },
        editInputStyle2: {
            maxHeight: 40,
        },
        container_list_wallet: {
            ...appStyles.mh20,
            ...appStyles.mt10,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.1,
            shadowRadius: 24,
            elevation: 10,
            flex: 1,
            backgroundColor: theme.colors.surface_surface_high,
            overflow: 'hidden',
        },
        inputAddressContainer: {
            backgroundColor: appColors.neutral.n100,
            padding: 0,
            height: 40,
        },
        view_inputAddress: {
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
            ...appStyles.justifyContentBetween,
            backgroundColor: theme.colors.surface_surface_high,
            shadowColor: appColors.neutral.n900,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.1,
            elevation: 4,
            borderRadius: 4,
            marginVertical: 10,
        },
        walletError: {
            borderColor: appColors.main.tokyoRed,
            borderWidth: 1,
        },
        cancelButton: {
            backgroundColor: theme.colors.surface_surface_high,
            borderColor: theme.colors.text_on_surface_text_brand_2,
            borderWidth:  0.5,
        },
        mainWrapper: {
            paddingHorizontal: 20,
            paddingTop: 10,
            flex: 1,
            backgroundColor: '#F5F6FC', // Premium light lilac background matching mockup
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
        },
        walletAddress: {
            fontSize: 12,
            color: '#7D859A',
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
        otherWalletCard: {
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: 'rgba(124, 58, 237, 0.05)',
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
