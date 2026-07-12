import { Feather } from "@expo/vector-icons";
import {
  BottomTabNavigationOptions,
  BottomTabNavigationProp,
} from "@react-navigation/bottom-tabs";
import { getHeaderTitle } from "@react-navigation/elements";
import {
  ParamListBase,
  RouteProp,
  StackActions,
} from "@react-navigation/native";
import React from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { EdgeInsets } from "react-native-safe-area-context";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import HeaderWalletBottomSheet from "src/components/common/HeaderWalletBottomSheet";
import BottomSheetProtocolView from "src/components/layout/BottomSheetProtocol";
import BottomSheetModal from "src/components/specific/BottomSheetModal/BottomSheetModal.view";
import BottomSheetModalGorhom from "src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view";
import BottomSheetWarningWallet from "src/components/specific/BottomSheetWalletWarning/bottomSheetWalletWarning.view";
import ProtocolImage from "src/components/specific/ProtocolImage";
import {
  AddFillSvgIcon,
  AddSvgIcon,
  ConnectSvgIcon,
} from "src/core/constants/AppIconsSvg";
import { appImages } from "src/core/constants/AppImages";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";
import AddWalletView from "src/features/home/components/AddWalletView";
import EditModalView from "src/features/home/components/EditModalView";
import RemoveModalView from "src/features/home/components/RemoveModalView";
import { MenuActionType } from "src/features/home/components/WalletBottomSheet/WalletBottomSheet.type";
import WalletMenuView from "src/features/home/components/WalletMenuView";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import useHeaderTabBar from "./headerTabbar.hook";
import useStyles from "./styles";

interface HeaderTabBarProps {
  titleI18N: string;
  insets: EdgeInsets;
  navigation: BottomTabNavigationProp<ParamListBase>;
  route?: RouteProp<ParamListBase, string>;
}

const HeaderTabBar: React.FC<HeaderTabBarProps> = ({
  titleI18N,
  insets,
  navigation,
  route,
}) => {
  const {
    isVisibleWarningCreateWalletModal,
    protocolListSort,
    isManagementBottomSheetWallet,
    bottomSheetProtocolRef,
    showBottomSheetModal,
    showMenuWallet,
    menuActionType,
    editWalletName,
    menuPosition,
    buttonRefs,
    remainWallet,
    currentWallet,
    quantityBrowse,
    showBottomSheetModalAction,
    editMainWallet,
    onConfirmRemoveAccount,
    handleOnPressImport,
    onWalletModalDismiss,
    closeShowBottomSheetModal,
    onCloseMenuWallet,
    setEditWalletName,
    onEditWalletName,
    onChangeMenuActionType,
    changeToAddWalletType,
    changeWalletAction,
    onShowMenuWallet,
    onSwipeEdit,
    onSwipeRemove,
    closeAddWalletView,
    showWalletWarningAction,
    createRestoreWalletAction,
    closeModalCreateNewWallet,
    createWalletAction,
    onWalletWarningModalDismiss,
    onCloseModalProtocol,
    onShowModalProtocol,
    handlePressProtocol,
    onScanPress,
    selectedProtocolId,
    protocolSelected,
    isLoadingImages,
    setLoadingImages,
    selectedWallet,
    refreshProtocolList,
    quantityConnect,
    onProtocolListRefresh,
    onDismissModalProtocol,
    searchValue,
    onChangeSearchValue,
    suggestionList,
    onPressSuggestion,
  } = useHeaderTabBar(titleI18N, navigation);

  const theme: AppThemeType = useAppTheme();
  const styles = useStyles(theme, insets);
  const getSubModalChild = () => {
    switch (menuActionType) {
      case MenuActionType.remove:
        return (
          <RemoveModalView
            onCancel={onCloseMenuWallet}
            onConfirm={onConfirmRemoveAccount}
          />
        );
      case MenuActionType.edit:
        return (
          <EditModalView
            onCancel={onCloseMenuWallet}
            onEdit={onEditWalletName}
            editWalletName={editWalletName}
            setEditWalletName={setEditWalletName}
            avtColor={
              selectedWallet ? selectedWallet.avtColor : currentWallet?.avtColor
            }
          />
        );

      default:
        return (
          <WalletMenuView
            menuPosition={menuPosition}
            onEditAction={() => {
              onChangeMenuActionType(MenuActionType.edit);
            }}
            onRemoveAction={() => {
              onChangeMenuActionType(MenuActionType.remove);
            }}
          />
        );
    }
  };
  const isScrolled = route?.params?.isScrolled ?? false;
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(isScrolled ? 1 : 0, { duration: 250 });
  }, [isScrolled]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: `rgba(7, 5, 26,1)`,
      borderBottomWidth: 1,
      borderBottomColor: `rgba(158, 134, 255, ${opacity.value * 0.25})`,
    };
  });

  return (
    <>
      <Animated.View style={[{ width: '100%', zIndex: 1000, paddingTop: insets.top,paddingBottom: 16 }, animatedStyle]}>
        <View style={[styles.container, { marginTop: 0 }]}>
        {titleI18N === LanguageKey.home_tab_crypto_title ? (
          <>
            <TouchableOpacity
              onPress={showBottomSheetModalAction}
              style={styles.accountIcon}
            >
              <Image
                source={appImages.aiLogo}
                style={{ width: 32, height: 32, borderRadius: 16 }}
              />
            </TouchableOpacity>

            <View style={styles.searchArea}>
              <View style={styles.searchBar}>
                <Feather
                  name="search"
                  size={18}
                  color={'white'}
                />
                <TextInput
                  placeholder="Trade"
                  placeholderTextColor={theme.colors.text_on_surface_text_medium}
                  style={styles.searchInput}
                  value={searchValue}
                  onChangeText={onChangeSearchValue}
                />
              </View>
              {suggestionList.length > 0 && (
                <View style={styles.suggestionContainer}>
                  {suggestionList.map((item: any, index: number) => (
                    <TouchableOpacity
                      key={`${item?.symbol ?? item?.name ?? "token"}-${index}`}
                      style={styles.suggestionItem}
                      onPress={() => onPressSuggestion(item)}
                    >
                      <Text style={styles.suggestionSymbol}>
                        {item?.type === "action"
                          ? "GO"
                          : String(item?.symbol ?? "").toUpperCase()}
                      </Text>
                      <Text style={styles.suggestionName} numberOfLines={1}>
                        {String(item?.name ?? "")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={onShowModalProtocol}
              style={[styles.iconBtn, { backgroundColor: "transparent" }]}
            >
              <ProtocolImage
                slip0044={protocolSelected?.slip0044}
                isDefaultData={protocolSelected?.isDefault}
                logoUri={protocolSelected?.logo}
                size={25}
              />
            </TouchableOpacity>



            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onScanPress}
            >
              <Feather name="maximize" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                navigation.dispatch(
                  StackActions.push(HomeStackScreenKey.ChatScreen)
                );
              }}
            >
              <Image
                source={appImages.ai_icon}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <AppText
              titleWithI18n={titleI18N}
              variant={TextVariantKeys.titleLarge}
              textColor="white"
            />
            <View style={[appStyles.flexRow, styles.iconContainer]}>
              {titleI18N === LanguageKey.home_tab_nft_collection_title && (
                <View style={[appStyles.flexRow]}>
                  <TouchableOpacity
                    onPress={handleOnPressImport}
                    style={styles.ml8}
                  >
                    <AddFillSvgIcon fill={"red"} width="24" height="24" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate(HomeStackScreenKey.MintNftScreen);
                    }}
                    style={styles.ml8}
                  >
                    <AddFillSvgIcon fill={"red"} width="24" height="24" />
                  </TouchableOpacity>
                </View>
              )}
              {titleI18N === LanguageKey.home_tab_explore_title && (
                <View style={appStyles.flexRow}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(HomeStackScreenKey.ConnectionScreen)
                    }
                  >
                    <ConnectSvgIcon
                      width="32"
                      height="32"
                      color={theme.colors.surface_surface_high}
                    />
                    <View style={styles.qualityConnect}>
                      <AppText
                        title={quantityConnect.toString()}
                        textColor={theme.colors.text_on_surface_text_brand_2}
                        variant={TextVariantKeys.bodyMTiny}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
        </View>
      </Animated.View>

      <BottomSheetModal
        maxHeight={isManagementBottomSheetWallet ? undefined : 0.78}
        showModal={showBottomSheetModal}
        onDismiss={onWalletModalDismiss}
        closeModalAction={closeShowBottomSheetModal}
        showSubModal={showMenuWallet}
        onCloseSubModalWhenClickOutside={() => onCloseMenuWallet()}
        subModalChild={getSubModalChild()}
        bottomChild={null}
        child={
          isManagementBottomSheetWallet ? (
            <HeaderWalletBottomSheet
              walletData={remainWallet ?? []}
              currentWallet={currentWallet}
              onSelectWalletItem={(item) => changeWalletAction(item)}
              onSwipeEdit={onSwipeEdit}
              onSwipeRemove={onSwipeRemove}
              onPressAdd={changeToAddWalletType}
            />
          ) : (
            <AddWalletView
              onClose={closeAddWalletView}
              onCreate={showWalletWarningAction}
              onRestore={createRestoreWalletAction}
            />
          )
        }
      />
      <BottomSheetWarningWallet
        isVisible={isVisibleWarningCreateWalletModal}
        closeModalCreateNewWallet={closeModalCreateNewWallet}
        continueAction={createWalletAction}
        onDismiss={onWalletWarningModalDismiss}
      />
      <BottomSheetModalGorhom
        refModal={bottomSheetProtocolRef}
        containerStyles={styles.protocolContainer}
        onDismiss={onDismissModalProtocol}
        enableContentPanningGesture={!Utils.isAndroid}
      >
        <BottomSheetProtocolView
          onCloseModalProtocol={onCloseModalProtocol}
          protocolDataLists={protocolListSort}
          selectedProtocolId={selectedProtocolId}
          handlePressProtocol={handlePressProtocol}
          isLoadingImages={isLoadingImages}
          setLoadingImages={setLoadingImages}
          refreshList={refreshProtocolList}
          onRefresh={onProtocolListRefresh}
        />
      </BottomSheetModalGorhom>
    </>
  );
};

export const renderHeaderTabbar = (
  options: BottomTabNavigationOptions,
  navigation: BottomTabNavigationProp<ParamListBase>,
  route: RouteProp<ParamListBase, string>,
  insets: EdgeInsets,
) => {
  const titleI18N = getHeaderTitle(options, route.name);
  return (
    <HeaderTabBar
      titleI18N={titleI18N}
      insets={insets}
      navigation={navigation}
      route={route}
    />
  );
};
