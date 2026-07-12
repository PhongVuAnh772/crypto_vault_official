import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-swiper';
import Svg, { Path } from 'react-native-svg';
import { mPlus1 } from 'src/core/constants/FontFamily';
import { ScreenWrapper } from 'src/components';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import AppLogoLoadingAnimation from 'src/components/common/AppLogoLoadingAnimation';
import CryptoButton from 'src/components/homeComponents/CryptoButton';
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import NativeAd from 'src/features/ads/components/NativeAd';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import SocialFeedSection from '../../socialFeed/components/SocialFeedSection';
import DraggableWidgets, { HomeWidgetData } from '../components/DraggableWidgets';
import HomeHeader from '../components/HomeHeader';
import HomeSkeletonLoading from '../components/HomeSkeletonLoading';
import ListCrypto from '../components/ListCrypto';
import WalletBottomSheet from '../components/WalletBottomSheet/WalletBottomSheet';
import { MenuActionType } from '../components/WalletBottomSheet/WalletBottomSheet.type';
import { ListCryptoDataType } from '../home.type';
import useEVMHome from './evm.home.hook';

const EVMHomeView: React.FC<RootNavigationType> = ({ navigation }) => {
    const theme = useAppTheme();
    const { t } = useTranslation();
    const styles = useStyles(theme);

    const [isScrolled, setIsScrolled] = React.useState(false);
    const handleScroll = (event: any) => {
        const offset = event.nativeEvent.contentOffset.y;
        const scrolled = offset > 20;
        if (scrolled !== isScrolled) {
            setIsScrolled(scrolled);
            navigation.setParams({ isScrolled: scrolled });
        }
    };
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
        onSwipeEdit,
        onSwipeRemove,
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
        goToScan,
        goToAIDetail,
    } = useEVMHome({
        navigation,
    });

    const topAsset = listCryptoData[0];
    const networkLabel = protocolBaseData?.symbol?.toUpperCase?.() || "NETWORK";
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
            amount: topAsset ? `${Utils.formattedCurrency(Number(topAsset.balance ?? 0))} ${topAsset.symbol ?? ''}` : '-',
            trend: topAsset?.name || t(LanguageKey.home_widget_no_data),
            trendUp: Number(topAsset?.balance ?? 0) >= 0,
        },
    ];
    const promoCards = [
        {
            title: t(LanguageKey.home_insight_portfolio_title, { network: networkLabel }),
            desc: t(LanguageKey.home_insight_portfolio_desc, { count: listCryptoData.length }),
        },
        {
            title: t(LanguageKey.home_insight_top_asset_title, { network: networkLabel }),
            desc: topAsset
                ? t(LanguageKey.home_insight_top_asset_desc, { token: `${topAsset.name} (${topAsset.symbol})` })
                : t(LanguageKey.home_widget_no_data),
        },
    ];

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
            backgroundColor="#07051A"
            subStyle={appStyles.flex1}>
            <WalletBottomSheet
                menuActionType={menuActionType}
                showBottomSheetModal={showBottomSheetModal}
                closeModalAction={closeShowBottomSheetModal}
                onDismiss={() => setIsAddView(false)}
                showSubModal={showMenuWallet}
                onCloseMenuWallet={onCloseMenuWallet}
                maxHeight={isAddView ? 0.78 : 0.7}
                removeWalletAction={removeWalletAction}
                editWalletAction={editWalletAction}
                newWalletAddress={newWalletAddress}
                setNewWalletAddress={setNewWalletAddress}
                avtColor={selectedAddress?.avtColor}
                onSwipeEdit={onSwipeEdit}
                onSwipeRemove={onSwipeRemove}
                isAddView={isAddView}
                setIsAddView={setIsAddView}
                addressList={addressList}
                protocolBaseData={protocolBaseData}
                selectedAddressId={selectedAddressId}
                handlePressWallet={handlePressWallet}
            />
            <Reanimated.ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshingHome ?? false}
                        onRefresh={handleHomeRefresh}
                        tintColor="#fff"
                    />
                }
                onScroll={handleScroll}
                scrollEventThrottle={16}
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
                    <Reanimated.View entering={FadeInDown.delay(100).springify().damping(15)} style={styles.swiperWrapper}>
                        <Swiper
                            height={110}
                            autoplay
                            autoplayTimeout={5}
                            activeDotColor="#9E86FF"
                            dotColor="rgba(255,255,255,0.2)"
                            paginationStyle={{ bottom: -8 }}
                        >
                            {/* Slide 1 */}
                            <TouchableOpacity activeOpacity={0.9} style={styles.promoCardInside}>
                                <View style={styles.promoIconCircle}>
                                    <Feather name="trending-up" size={18} color="#9E86FF" />
                                </View>
                                <View style={styles.promoTextContainer}>
                                    <Text style={styles.promoTitle} numberOfLines={1}>{promoCards[0].title}</Text>
                                    <Text style={styles.promoSub} numberOfLines={1}>{promoCards[0].desc}</Text>
                                </View>
                                <View style={styles.promoRightContainer}>
                                    <Svg width={40} height={20} style={{ marginRight: 8 }}>
                                        <Path
                                            d="M0,15 Q10,5 20,12 T40,5"
                                            fill="none"
                                            stroke="#2EBD63"
                                            strokeWidth={2}
                                        />
                                    </Svg>
                                    <View style={styles.greenBadge}>
                                        <Text style={styles.greenBadgeText}>+2.45%</Text>
                                    </View>
                                    <Feather name="chevron-right" size={16} color="#8F9BB3" style={{ marginLeft: 6 }} />
                                </View>
                            </TouchableOpacity>

                            {/* Slide 2 */}
                            <TouchableOpacity activeOpacity={0.9} style={styles.promoCardInside}>
                                <View style={styles.promoIconCircle}>
                                    <Feather name="activity" size={18} color="#9E86FF" />
                                </View>
                                <View style={styles.promoTextContainer}>
                                    <Text style={styles.promoTitle} numberOfLines={1}>{promoCards[1].title}</Text>
                                    <Text style={styles.promoSub} numberOfLines={1}>{promoCards[1].desc}</Text>
                                </View>
                                <View style={styles.promoRightContainer}>
                                    <Svg width={40} height={20} style={{ marginRight: 8 }}>
                                        <Path
                                            d="M0,10 Q10,18 20,8 T40,12"
                                            fill="none"
                                            stroke="#2EBD63"
                                            strokeWidth={2}
                                        />
                                    </Svg>
                                    <View style={styles.greenBadge}>
                                        <Text style={styles.greenBadgeText}>+1.82%</Text>
                                    </View>
                                    <Feather name="chevron-right" size={16} color="#8F9BB3" style={{ marginLeft: 6 }} />
                                </View>
                            </TouchableOpacity>
                        </Swiper>
                    </Reanimated.View>

                    <Reanimated.View entering={FadeInDown.delay(200).springify().damping(15)}>
                        <DraggableWidgets widgets={widgets} />
                    </Reanimated.View>

                    <Reanimated.View entering={FadeInDown.delay(300).springify().damping(15)}>
                        <ListCrypto
                            data={listCryptoData}
                            handleSeeAll={goToMangeCryptoScreen}
                            handlePressItem={onPressTokenDetailEVM}
                        />
                    </Reanimated.View>

                    <Reanimated.View entering={FadeInDown.delay(400).springify().damping(15)}>
                        <SocialFeedSection limit={3} />
                    </Reanimated.View>
                </HomeSkeletonLoading>
            </Reanimated.ScrollView>
            <AppLogoLoadingAnimation isLoading={false} />
        </ScreenWrapper>
    );
};

const useStyles = (theme: any) => StyleSheet.create({
    swiperWrapper: {
        height: 100,
        marginTop: 16,
        marginBottom: 10,
    },
    promoCardInside: {
        backgroundColor: '#131435', // Dark background matching mockup
        borderRadius: 16,
        marginHorizontal: 16,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        height: 72,
        borderWidth: 1,
        borderColor: '#1D1E4E',
    },
    promoIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2A1B60', // Dark purple background matching mockup
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    promoTextContainer: {
        flex: 1,
        paddingRight: 8,
    },
    promoTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: mPlus1.bold,
        marginBottom: 2,
    },
    promoSub: {
        fontSize: 11,
        color: '#8F9BB3',
        fontFamily: mPlus1.medium,
    },
    promoRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greenBadge: {
        backgroundColor: 'rgba(46, 189, 99, 0.15)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    greenBadgeText: {
        color: '#2EBD63',
        fontSize: 10,
        fontWeight: '700',
        fontFamily: mPlus1.bold,
    },
});

export default EVMHomeView;

