import React from "react";
import { RefreshControl, ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { ScreenWrapper } from "src/components";
import CryptoButton from "src/components/homeComponents/CryptoButton";
import appStyles from "src/core/styles";
import TonUtils from "src/core/utils/tonUtils";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { rootNavigate } from "src/navigation/stacks/type/RootParamListType";
import HomeHeader from "../components/HomeHeader";
import HomeSkeletonLoading from "../components/HomeSkeletonLoading";
import ListCrypto from "../components/ListCrypto";
import WalletBottomSheet from "../components/WalletBottomSheet/WalletBottomSheet";
import { MenuActionType } from "../components/WalletBottomSheet/WalletBottomSheet.type";
import { ListCryptoDataType } from "../home.type";
import { setSelectedCryptoDataId } from "../slice/home.slice";
import useTonHome from "./ton.home.hook";
import Swiper from 'react-native-swiper';
import DraggableWidgets from '../components/DraggableWidgets';
import { t } from "i18next";
import LanguageKey from "src/core/locales/LanguageKey";

const TonHomeView: React.FC<RootNavigationType> = ({ navigation }) => {
  const theme = useAppTheme();
  const styles = useStyles(theme);
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
    selectedCurrencySetting,
    dispatch,
    showBottomSheetModal,
    showBottomSheetModalAction,
    closeShowBottomSheetModal,
    isAddView,
    setIsAddView,
    menuActionType,
    onCloseMenuWallet,
    showMenuWallet,
    removeWalletAction,
    editWalletAction,
    newWalletAddress,
    setNewWalletAddress,
    menuPosition,
    addressList,
    selectedAddressId,
    protocolBaseData,
    handlePressWallet,
    onShowMenuWallet,
    onChangeMenuActionType,
  } = useTonHome({
    navigation,
  });

  const handlePressItem = (item: ListCryptoDataType) => {
    dispatch(setSelectedCryptoDataId(item.id));
    if (item.navigationKey) {
      rootNavigate(item.navigationKey, item.navigationParams as object);
    }
  };

  return (
    <ScreenWrapper
      subStyle={[appStyles.flex1, { backgroundColor: '#F2F2F7' }]}
    >
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
        buttonRefs={{ current: {} } as any} // Placeholder for refs
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
            goToMoreActionScreen={() => navigation.navigate(HomeStackScreenKey.MoreActionScreen)}
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

              {/* Slide 2 - Learn & Earn */}
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
            handlePressItem={handlePressItem}
          />

          <DraggableWidgets />
        </HomeSkeletonLoading>
      </ScrollView>
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
});

export default TonHomeView;
