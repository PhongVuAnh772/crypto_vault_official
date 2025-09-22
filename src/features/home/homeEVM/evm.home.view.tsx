import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppLogoLoadingAnimation from 'src/components/common/AppLogoLoadingAnimation';
import CryptoButton from 'src/components/homeComponents/CryptoButton';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import HomeHeader from '../components/HomeHeader';
import HomeSkeletonLoading from '../components/HomeSkeletonLoading';
import ListCrypto from '../components/ListCrypto';
import WalletBottomSheet from '../components/WalletBottomSheet/WalletBottomSheet';
import { MenuActionType } from '../components/WalletBottomSheet/WalletBottomSheet.type';
import { ListCryptoDataType } from '../home.type';
import useEVMHome from './evm.home.hook';

const EVMHomeView: React.FC<RootNavigationType> = ({ navigation }) => {
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
        goToStakeScreen,
        showBottomSheetModalAction,
        selectedCurrencySetting,
        menuActionType,
        currencyRateConversion,
        getBackgroundImage,
        goToSwap,
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
            paddingTop
            paddingBottom
            backgroundImage={getBackgroundImage()}
            subStyle={[appStyles.pH25, appStyles.flex1, appStyles.mt30]}>
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
                        onPressWallet={showBottomSheetModalAction}
                        withoutCurrencyRate={true}
                        goToSwap={goToSwap}
                        gotoScan={()=> {}}
                    />
                    <ListCrypto
                        cryptoDataLists={listCryptoData}
                        gotoManageCrypto={goToMangeCryptoScreen}
                        renderItem={renderItem}
                    />
                </HomeSkeletonLoading>
            </ScrollView>
            <AppLogoLoadingAnimation isLoading={false} />
        </ScreenWrapper>
    );
};

export default EVMHomeView;
