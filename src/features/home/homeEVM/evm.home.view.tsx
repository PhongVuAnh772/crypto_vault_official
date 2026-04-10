import { t } from "i18next";
import React from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-swiper';
import { ScreenWrapper } from 'src/components';
import AppLogoLoadingAnimation from 'src/components/common/AppLogoLoadingAnimation';
import CryptoButton from 'src/components/homeComponents/CryptoButton';
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import DraggableWidgets from '../components/DraggableWidgets';
import HomeHeader from '../components/HomeHeader';
import HomeSkeletonLoading from '../components/HomeSkeletonLoading';
import ListCrypto from '../components/ListCrypto';
import WalletBottomSheet from '../components/WalletBottomSheet/WalletBottomSheet';
import { MenuActionType } from '../components/WalletBottomSheet/WalletBottomSheet.type';
import { ListCryptoDataType } from '../home.type';
import useEVMHome from './evm.home.hook';

const EVMHomeView: React.FC<RootNavigationType> = ({ navigation }) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);
    const {
        goToSendScreen,
        goToReceive,
        goToMangeCryptoScreen,
        refreshingHome,
        handleHomeRefresh,
        walletBalanceCurrency,
        protocolBaseData,
        listCryptoData,
        handlePressWallet,
        selectedAddress,
        addressList,
        selectedAddressId,
        menuPosition,
        buttonRefs,
        showMenuWallet,
        onCloseMenuWallet,
        onShowMenuWallet,
        onChangeMenuActionType,
        showBottomSheetModal,
        closeShowBottomSheetModal,
        setNewWalletAddress,
        newWalletAddress,
        isAddView,
        setIsAddView,
        removeWalletAction,
        editWalletAction,
        isFirstInitial,
        onPressTokenDetailEVM,
        showBottomSheetModalAction,
        selectedCurrencySetting,
        menuActionType,
        currencyRateConversion,
    } = useEVMHome({
        navigation,
    });

    const renderItem = ({
        item,
        index,
    }: {
        item: ListCryptoDataType;
        index: number;
    }) => {
        const handleOnPress = () => {
            onPressTokenDetailEVM(item);
        };

        const handleBalanceEVM = () => {
            if (!item.decimal) {
                return '0';
            }
            const balanceConverted = Utils.convertBigIntFollowDecimals(
                item.balance + '',
                item.decimal,
            );
            return Utils.formattedBalanceCurrency(+balanceConverted);
        };
        const balanceEVM = handleBalanceEVM();

        const coinAmount =
            selectedCurrencySetting.rate *
            (item.rateCurrency ?? 1) *
            currencyRateConversion;

        const cutCoinAmount = Utils.truncateToNumberDecimals(coinAmount, 2);

        const coinToCurrencyString = item.rateCurrency
            ? `${selectedCurrencySetting.sign ?? ''} ${Utils.formattedCurrency(cutCoinAmount)}`
            : '-';

        const parsedBalance = parseFloat(balanceEVM.replace(/,/g, ''));
        const balanceAmountEVM = parsedBalance * cutCoinAmount;

        const balanceToCurrencyString = item.rateCurrency
            ? `${Utils.formattedCurrency(balanceAmountEVM)} ${selectedCurrencySetting.symbol ?? ''}`
            : '-';

        const showBalance = item.balance === undefined ? '-' : balanceEVM;

        return (
            <CryptoButton
                key={index}
                title={item.name}
                symbol={item.symbol}
                balanceString={showBalance}
                onPress={handleOnPress}
                logoUri={item.logo}
                isDefaultData={item.baseData?.isDefault}
                slip0044={item.baseData?.slip0044}
                baseRateFiatString={coinToCurrencyString}
                balanceToCurrencyString={balanceToCurrencyString}
            />
        );
    };

    return (
        <ScreenWrapper
            subStyle={appStyles.flex1}>
            <WalletBottomSheet
                menuActionType={menuActionType}
                showBottomSheetModal={showBottomSheetModal}
                closeModalAction={closeShowBottomSheetModal}
                onDismiss={() => setIsAddView(false)}
                showSubModal={showMenuWallet}
                onCloseMenuWallet={onCloseMenuWallet}
                maxHeight={isAddView ? 0.5 : 0.7}
                removeWalletAction={removeWalletAction}
                editWalletAction={editWalletAction}
                newWalletAddress={newWalletAddress}
                setNewWalletAddress={setNewWalletAddress}
                avtColor={selectedAddress?.avtColor}
                menuPosition={menuPosition}
                onEditAction={() => {
                    onChangeMenuActionType(MenuActionType.edit);
                }}
                onRemoveAction={() => {
                    onChangeMenuActionType(MenuActionType.remove);
                }}
                isAddView={isAddView}
                setIsAddView={setIsAddView}
                addressList={addressList}
                protocolBaseData={protocolBaseData}
                selectedAddressId={selectedAddressId}
                handlePressWallet={handlePressWallet}
                onShowMenuWallet={(item, index) => {
                    onShowMenuWallet(item, index);
                }}
                buttonRefs={buttonRefs}
            />
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshingHome ?? false}
                        onRefresh={handleHomeRefresh}
                        tintColor="#fff"
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <HomeSkeletonLoading isLoading={isFirstInitial}>
                    <HomeHeader
                        balance={walletBalanceCurrency}
                        goToSendScreen={goToSendScreen}
                        goToReceive={goToReceive}
                        goToDepositOptions={() => navigation.navigate(HomeStackScreenKey.DepositOptions)}
                        goToMoreActionScreen={() => { }}
                        onPressAccount={showBottomSheetModalAction}
                    />

                    {/* Promo Swiper Section */}
                    <View style={styles.swiperWrapper}>
                        <Swiper
                            height={130}
                            autoplay
                            autoplayTimeout={5}
                            activeDotColor="#121212"
                            dotColor="rgba(0,0,0,0.1)"
                            paginationStyle={{ bottom: 5 }}
                        >
                            {/* Slide 1 - Invite Friends */}
                            <TouchableOpacity activeOpacity={0.9} style={styles.promoCardInside}>
                                <View style={styles.promoTextContainer}>
                                    <Text style={styles.promoTitle}>{t(LanguageKey.home_promo_invite_title)}</Text>
                                    <Text style={styles.promoSub}>{t(LanguageKey.home_promo_invite_desc)}</Text>
                                </View>
                                <Image
                                    source={{ uri: 'https://i.ibb.co/V9hV9V9/gift.png' }}
                                    style={styles.promoImage}
                                />
                            </TouchableOpacity>

                            {/* Slide 2 - Crypto Courses */}
                            <TouchableOpacity activeOpacity={0.9} style={styles.promoCardInside}>
                                <View style={styles.promoTextContainer}>
                                    <Text style={styles.promoTitle}>{t(LanguageKey.home_promo_learn_earn_title)}</Text>
                                    <Text style={styles.promoSub}>{t(LanguageKey.home_promo_learn_earn_desc)}</Text>
                                </View>
                                <Image
                                    source={{ uri: 'https://i.ibb.co/XzVzVzV/avatar.png' }}
                                    style={styles.promoImage}
                                />
                            </TouchableOpacity>
                        </Swiper>
                    </View>

                    <ListCrypto
                        data={listCryptoData}
                        handleSeeAll={goToMangeCryptoScreen}
                        handlePressItem={onPressTokenDetailEVM}
                    />

                    <DraggableWidgets />
                </HomeSkeletonLoading>
            </ScrollView>
            <AppLogoLoadingAnimation isLoading={false} />
        </ScreenWrapper>
    );
};

const useStyles = (theme: any) => StyleSheet.create({
    swiperWrapper: {
        height: 135,
        marginTop: -30,
    },
    promoCardInside: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 20,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
        height: 100,
    },
    promoTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    promoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    promoSub: {
        fontSize: 12,
        color: '#8E8E93',
        lineHeight: 16,
    },
    promoImage: {
        width: 80,
        height: 60,
        resizeMode: 'contain',
    },
    promoClose: {
        position: 'absolute',
        top: 10,
        right: 15,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#C7C7CC',
        marginHorizontal: 3,
    },
    dotInactive: {
        opacity: 0.3,
    },
});

export default EVMHomeView;
