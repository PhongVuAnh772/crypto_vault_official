import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { ScreenWrapper } from 'src/components';
import CryptoButton from 'src/components/homeComponents/CryptoButton';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { rootNavigate } from 'src/navigation/stacks/type/RootParamListType';
import HomeHeader from '../components/HomeHeader';
import HomeSkeletonLoading from '../components/HomeSkeletonLoading';
import ListCrypto from '../components/ListCrypto';
import { ListCryptoDataType } from '../home.type';
import { setSelectedCryptoDataId } from '../slice/home.slice';
import useBitcoinHome from './bitcoin.home.hook';

const BitcoinHomeView: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        goToSendScreen,
        goToReceive,
        goToMangeCryptoScreen,
        refreshingHome,
        handleHomeRefresh,
        walletBalanceCurrency,
        listCryptoData,
        selectedAddress,
        isFirstInitial,
        goToStakeScreen,
        selectedCurrencySetting,
        dispatch,
        getBackgroundImage,
    } = useBitcoinHome({
        navigation,
    });
    console.log('=======================');
    console.log('BitcoinHomeView render');
    console.log('=======================');

    const renderItem = ({
        item,
        index,
    }: {
        item: ListCryptoDataType;
        index: number;
    }) => {
        const handleOnPress = () => {
            dispatch(setSelectedCryptoDataId(item.id));
            if (item.navigationKey) {
                rootNavigate(
                    item.navigationKey,
                    item.navigationParams as object,
                );
            }
        };

        const rateCurrency = item.rateCurrency;
        const balance = item.balance;

        const isShowFiat = !!item.rateCurrency;

        const coinAmount = selectedCurrencySetting.rate * (rateCurrency ?? 1);

        const balanceAmount =
            (balance ?? 0) * selectedCurrencySetting.rate * (rateCurrency ?? 1);

        const coinToCurrency = Utils.fiatFormat(coinAmount);
        const balanceToCurrency = Utils.formattedCurrency(balanceAmount);

        const baseRateFiatString = `${selectedCurrencySetting.sign ?? ''} ${coinToCurrency}`;
        const balanceToCurrencyString =
            coinAmount > 0
                ? `${balanceToCurrency} ${selectedCurrencySetting.symbol ?? ''}`
                : '-';

        const balanceConverted = Utils.formattedBalanceCurrency(balance ?? 0);

        return (
            <CryptoButton
                key={index}
                title={item.name}
                symbol={item.symbol}
                balanceString={balanceConverted}
                onPress={handleOnPress}
                logoUri={item.logo}
                isDefaultData={item.baseData?.isDefault}
                slip0044={item.baseData?.slip0044}
                baseRateFiatString={isShowFiat ? baseRateFiatString : undefined}
                balanceToCurrencyString={
                    isShowFiat ? balanceToCurrencyString : undefined
                }
            />
        );
    };

    return (
        <ScreenWrapper
            paddingTop
            paddingBottom
            backgroundImage={getBackgroundImage()}
            subStyle={[appStyles.pH25, appStyles.flex1, appStyles.mt30]}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshingHome ?? false}
                        onRefresh={handleHomeRefresh}
                    />
                }
                showsVerticalScrollIndicator={false}
                style={appStyles.mt20}>
                <HomeSkeletonLoading isLoading={isFirstInitial}>
                    <HomeHeader
                        walletData={selectedAddress}
                        balance={walletBalanceCurrency}
                        goToSendScreen={goToSendScreen}
                        goToReceive={goToReceive}
                        goToStakeScreen={goToStakeScreen}
                        goToSwap={()=>{}}
                        gotoScan={()=> navigation.navigate(HomeStackScreenKey.ScanScreen)}
                    />
                    <ListCrypto
                        cryptoDataLists={listCryptoData}
                        gotoManageCrypto={goToMangeCryptoScreen}
                        renderItem={renderItem}
                    />
                </HomeSkeletonLoading>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default BitcoinHomeView;
