import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import AppButton from 'src/components/common/AppButton';
import AppModal from 'src/components/common/AppModal';
import AppSeparator from 'src/components/common/AppSeparator';
import AppText from 'src/components/common/AppText';
import WalletItem from 'src/components/homeComponents/WalletItem';
import appColors from 'src/core/constants/AppColors';
import { DeleteTextSvgIcon, PlusSvgIcon } from 'src/core/constants/AppIconsSvg';
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

type BottomSheetWalletViewType = {
    isAddView: boolean;
    setIsAddView: React.Dispatch<React.SetStateAction<boolean>>;
    onPressAdd?: () => void;
    addressList: AddressListItemType[] | undefined;
    selectedAddressId: string | undefined;
    handlePressWallet: (data: AddressListItemType) => void;
    protocolBaseData?: ProtocolDataWithSupportedTokensFormBEType;
    onShowMenuWallet: (item: AddressListItemType, index: number) => void;
    buttonRefs: React.MutableRefObject<{
        [key: string]: TouchableOpacity | null;
    }>;
    closeParentBottomSheetModal?: () => void;
};

const BottomSheetWalletView: React.FC<BottomSheetWalletViewType> = ({
    addressList,
    selectedAddressId,
    handlePressWallet,
    onShowMenuWallet,
    protocolBaseData,
    buttonRefs,
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
        <View
            style={[
                styles.container_list_wallet,
                { marginBottom: insets.bottom + 30 },
            ]}>
            <FlatList
                ref={flatListRef}
                data={addressList}
                bounces={false}
                keyExtractor={item => item.id}
                renderItem={({ item, index }) => {
                    const isSelectedAddressId = item.id === selectedAddressId;
                    return (
                        <WalletItem
                            item={item}
                            onPress={handlePressWallet}
                            onShowMenuWallet={(item, index) => {
                                onShowMenuWallet(item, index);
                            }}
                            theme={theme}
                            isSelected={isSelectedAddressId}
                            buttonRefs={buttonRefs}
                            index={index}
                        />
                    );
                }}
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
            {protocolBaseData?.VM !== VMType.Bitcoin && protocolBaseData?.VM !== VMType.Ton && (
                <TouchableOpacity onPress={() => (onPressAdd ? onPressAdd() : setIsAddView(true))}>
                    <View
                        style={[
                            appStyles.flexRow,
                            appStyles.justifyContentCenter,
                            appStyles.pd15,
                            appStyles.alignItemsCenter,
                        ]}>
                        <AppText
                            titleWithI18n={LanguageKey.wallet_add_another}
                            variant={TextVariantKeys.titleSmall}
                            textColor={appColors.main.tokyoRed}
                            styles={[appStyles.mr10]}
                        />
                        <PlusSvgIcon
                            color={appColors.main.tokyoRed}
                            width={14}
                            height={14}
                        />
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
    });
