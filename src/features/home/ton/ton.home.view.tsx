import React from "react";
import { RefreshControl, ScrollView } from "react-native";
import { ScreenWrapper } from "src/components";
import CryptoButton from "src/components/homeComponents/CryptoButton";
import appStyles from "src/core/styles";
import TonUtils from "src/core/utils/tonUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { rootNavigate } from "src/navigation/stacks/type/RootParamListType";
import HomeHeader from "../components/HomeHeader";
import HomeSkeletonLoading from "../components/HomeSkeletonLoading";
import ListCrypto from "../components/ListCrypto";
import { ListCryptoDataType } from "../home.type";
import { setSelectedCryptoDataId } from "../slice/home.slice";
import useTonHome from "./ton.home.hook";

const TonHomeView: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    goToSendScreen,
    goToReceive,
    goToMangeCryptoScreen,
    refreshingHome,
    handleHomeRefresh,
    listCryptoData,
    walletBalanceCurrency,
    selectedAddress,
    isFirstInitial,
    goToStakeScreen,
    selectedCurrencySetting,
    getBackgroundImage,
    dispatch,
  } = useTonHome({
    navigation,
  });
  console.log("====================");
  console.log("TonHomeView Render");
  console.log("====================");

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
        rootNavigate(item.navigationKey, item.navigationParams as object);
      }
    };
    const isShowFiat = item.isNative
      ? !!item.rateCurrency
      : !!item.tokenRateCurrency;

    const { balanceString, baseRateFiatString, balanceFiatString } =
      TonUtils.convertBalanceWithFiat({
        balance: item.balance,
        balanceToken: item.balanceToken,
        isNative: item.isNative ?? false,
        tokenRate: item.tokenRateCurrency,
        protocolRate: item.rateCurrency,
        settingCurrencyRate: selectedCurrencySetting.rate,
        isRedXToken: item.isRedXToken,
      });

    const baseRateFiatStringWithSign = `${selectedCurrencySetting.sign ?? ""} ${baseRateFiatString}`;
    const balanceToCurrencyString = `${balanceFiatString} ${selectedCurrencySetting.symbol ?? ""}`;

    return (
      <CryptoButton
        key={index}
        title={item.name}
        symbol={item.symbol}
        balanceString={balanceString}
        onPress={handleOnPress}
        logoUri={item.logo}
        isDefaultData={item.baseData?.isDefault}
        slip0044={item.baseData?.slip0044}
        baseRateFiatString={isShowFiat ? baseRateFiatStringWithSign : undefined}
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
      subStyle={[appStyles.pH15, appStyles.flex1, appStyles.mt30]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshingHome ?? false}
            onRefresh={handleHomeRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        style={appStyles.mt20}
      >
        <HomeSkeletonLoading isLoading={isFirstInitial}>
          <HomeHeader
            goToSwap={() => {}}
            walletData={selectedAddress}
            balance={walletBalanceCurrency}
            goToSendScreen={goToSendScreen}
            goToReceive={goToReceive}
            goToStakeScreen={goToStakeScreen}
            withoutCurrencyRate={true}
            gotoScan={() => navigation.navigate(HomeStackScreenKey.ScanScreen)}
            hiddenScan={true}
            goToMoreActionScreen={() => navigation.navigate(HomeStackScreenKey.MoreActionScreen)}
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

export default TonHomeView;
