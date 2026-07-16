import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-swiper';
import { ScreenWrapper } from 'src/components';
import AppLogoLoadingAnimation from 'src/components/common/AppLogoLoadingAnimation';
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import SocialFeedSection from '../../socialFeed/components/SocialFeedSection';
import DraggableWidgets, { HomeWidgetData } from '../components/DraggableWidgets';
import HomeHeader from '../components/HomeHeader';
import HomeSkeletonLoading from '../components/HomeSkeletonLoading';
import ListCrypto from '../components/ListCrypto';
import WalletBottomSheet from '../components/WalletBottomSheet/WalletBottomSheet';
import useBitcoinHome from './bitcoin.home.hook';

const BitcoinHomeView: React.FC<RootNavigationType> = ({ navigation }) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);
    const {
        t,
        goToSendScreen,
        goToReceive,
        goToMangeCryptoScreen,
        refreshingHome,
        handleHomeRefresh,
        walletBalanceCurrency,
        selectedCurrencySetting,
        protocolBaseData,
        listCryptoData,
        handlePressWallet,
        selectedAddress,
        addressList,
        selectedAddressId,
        menuPosition,
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
        isFirstInitial,
        showBottomSheetModalAction,
        menuActionType,
        goToScan,
        goToAIDetail,
    } = useBitcoinHome({
        navigation,
    });

    const topAsset = listCryptoData[0];
    const networkLabel = protocolBaseData?.symbol?.toUpperCase?.() || "NETWORK";
    const promoCards = [
        {
            title: t(LanguageKey.home_insight_portfolio_title, { network: networkLabel }),
            desc: t(LanguageKey.home_insight_portfolio_desc, { count: listCryptoData.length }),
            action: () => navigation.navigate(HomeStackScreenKey.ManageCrypto),
        },
        {
            title: t(LanguageKey.home_insight_top_asset_title, { network: networkLabel }),
            desc: topAsset
                ? t(LanguageKey.home_insight_top_asset_desc, { token: `${topAsset.name} (${topAsset.symbol})` })
                : t(LanguageKey.home_widget_no_data),
            action: () => navigation.navigate(HomeStackScreenKey.ManageCrypto),
        },
    ];
    const widgets: HomeWidgetData[] = [
        {
            id: 'portfolio',
            label: t(LanguageKey.home_widget_portfolio_label),
            amount: `${selectedCurrencySetting?.sign ?? '$'} ${Utils.formattedCurrency(walletBalanceCurrency || 0)}`,
            trend: t(LanguageKey.home_widget_assets_count, { count: listCryptoData.length }),
            trendUp: true,
        },
        {
            id: 'top-asset',
            label: t(LanguageKey.home_widget_top_asset_label),
            amount: topAsset ? `${Utils.formattedCurrency(topAsset.balance ?? 0)} ${topAsset.symbol ?? ''}` : '-',
            trend: topAsset?.name || t(LanguageKey.home_widget_no_data),
            trendUp: (topAsset?.balance ?? 0) >= 0,
        },
    ];

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
                newWalletAddress={newWalletAddress}
                setNewWalletAddress={setNewWalletAddress}
                avtColor={selectedAddress?.avtColor}
                menuPosition={menuPosition}
                onEditAction={() => {
                    onChangeMenuActionType('edit' as any);
                }}
                onRemoveAction={() => {
                    onChangeMenuActionType('remove' as any);
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
                buttonRefs={{ current: {} } as any} removeWalletAction={function (): Promise<void> {
                    throw new Error('Function not implemented.');
                }} editWalletAction={function (): Promise<void> {
                    throw new Error('Function not implemented.');
                }} />
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
                        goToMoreActionScreen={() => navigation.navigate(HomeStackScreenKey.MoreActionScreen)}
                        onPressAccount={showBottomSheetModalAction}
                        onPressScan={goToScan}
                        onPressAI={goToAIDetail}
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
                                    <Text style={styles.promoTitle}>{promoCards[0].title}</Text>
                                    <Text style={styles.promoSub}>{promoCards[0].desc}</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Slide 2 - Crypto Courses */}
                            <TouchableOpacity activeOpacity={0.9} style={styles.promoCardInside}>
                                <View style={styles.promoTextContainer}>
                                    <Text style={styles.promoTitle}>{promoCards[1].title}</Text>
                                    <Text style={styles.promoSub}>{promoCards[1].desc}</Text>
                                </View>
                            </TouchableOpacity>
                        </Swiper>
                    </View>

                    <ListCrypto
                        data={listCryptoData}
                        handleSeeAll={goToMangeCryptoScreen}
                        handlePressItem={() => { }}
                    />

                    <DraggableWidgets widgets={widgets} />

                    <SocialFeedSection limit={3} />
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
});

export default BitcoinHomeView;
