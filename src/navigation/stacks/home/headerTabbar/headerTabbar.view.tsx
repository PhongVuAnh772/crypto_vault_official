import {
  BottomTabNavigationOptions,
  BottomTabNavigationProp,
} from "@react-navigation/bottom-tabs";
import { getHeaderTitle } from "@react-navigation/elements";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
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
  ArrowDownSvgIcon,
  ConnectSvgIcon,
  WalletLogoSvgIcon,
} from "src/core/constants/AppIconsSvg";
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
}

const HeaderTabBar: React.FC<HeaderTabBarProps> = ({
  titleI18N,
  insets,
  navigation,
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
    closeAddWalletView,
    showWalletWarningAction,
    createRestoreWalletAction,
    closeModalCreateNewWallet,
    createWalletAction,
    onWalletWarningModalDismiss,
    onCloseModalProtocol,
    onShowModalProtocol,
    handlePressProtocol,
    selectedProtocolId,
    protocolSelected,
    isLoadingImages,
    setLoadingImages,
    selectedWallet,
    refreshProtocolList,
    quantityConnect,
    onProtocolListRefresh,
    onDismissModalProtocol,
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
  return (
    <>
      <View style={styles.container}>
        {titleI18N === LanguageKey.home_tab_crypto_title ? (
          <View style={[appStyles.flexRow, appStyles.center]}>
            <TouchableOpacity
              onPress={showBottomSheetModalAction}
              style={styles.accountIcon}
            >
              <WalletLogoSvgIcon color={currentWallet?.avtColor} />
            </TouchableOpacity>
          </View>
        ) : (
          <AppText
            titleWithI18n={titleI18N}
            variant={TextVariantKeys.titleLarge}
            textColor={theme.colors.text_on_surface_text_highest}
          />
        )}

        {titleI18N === LanguageKey.home_tab_crypto_title ? (
          <TouchableOpacity
            onPress={onShowModalProtocol}
            style={styles.account}
          >
            <View style={appStyles.mr5}>
              <ProtocolImage
                slip0044={protocolSelected?.slip0044}
                isDefaultData={protocolSelected?.isDefault}
                logoUri={protocolSelected?.logo}
              />
            </View>
            <AppText
              title={protocolSelected?.name}
              numberOfLines={1}
              variant={TextVariantKeys.bodyMSmall}
              textColor={theme.colors.text_on_surface_text_high}
            />
            <View style={appStyles.ml5}>
              <ArrowDownSvgIcon
                color={theme.colors.text_on_surface_text_highest}
              />
            </View>
          </TouchableOpacity>
        ) : null}

        <View style={[appStyles.flexRow, styles.iconContainer]}>
          {titleI18N === LanguageKey.home_tab_nft_collection_title && (
            <TouchableOpacity onPress={handleOnPressImport} style={styles.ml8}>
              <AddFillSvgIcon fill={"red"} width="24" height="24" />
            </TouchableOpacity>
          )}
          {titleI18N === LanguageKey.home_tab_explore_title && (
            <View style={appStyles.flexRow}>
              {/* <TouchableOpacity onPress={() =>
                                    navigation.navigate(
                                        HomeStackScreenKey.BrowseScreen,
                                    )}>
                                <LanguageSvgIcon
                                    width="30"
                                    height="30"
                                    color={theme.colors.surface_surface_high}
                                />
                                 <View
                                    style={styles.qualityConnect}>
                                    <AppText
                                        title={quantityBrowse+''}
                                        textColor={
                                            theme.colors
                                                .text_on_surface_text_brand_2
                                        }
                                        variant={TextVariantKeys.bodyMTiny

                                        }
                                    />
                                </View>
                            </TouchableOpacity> */}
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
      </View>

      <BottomSheetModal
        maxHeight={isManagementBottomSheetWallet ? undefined : 0.57}
        showModal={showBottomSheetModal}
        onDismiss={onWalletModalDismiss}
        closeModalAction={closeShowBottomSheetModal}
        showSubModal={showMenuWallet}
        onCloseSubModalWhenClickOutside={() => onCloseMenuWallet()}
        subModalChild={getSubModalChild()}
        bottomChild={
          isManagementBottomSheetWallet ? (
            <View style={appStyles.pH25}>
              <AppButton
                onPress={changeToAddWalletType}
                titleWithI18n={LanguageKey.account_add_another}
                styles={styles.addAccountButton}
                textVariant={TextVariantKeys.titleSmall}
                textColor={theme.colors.text_on_surface_text_brand_2}
                rightIcon={
                  <View style={appStyles.ml5}>
                    <AddSvgIcon />
                  </View>
                }
              />
            </View>
          ) : null
        }
        child={
          isManagementBottomSheetWallet ? (
            <HeaderWalletBottomSheet
              buttonRefs={buttonRefs}
              walletData={remainWallet ?? []}
              currentWallet={currentWallet}
              onSelectWalletItem={(item) => changeWalletAction(item)}
              onShowMenuWallet={(item, index) => {
                onShowMenuWallet(item, index);
              }}
              editMainWallet={editMainWallet}
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
  insets: EdgeInsets
) => {
  const titleI18N = getHeaderTitle(options, route.name);
  return (
    <HeaderTabBar
      titleI18N={titleI18N}
      insets={insets}
      navigation={navigation}
    />
  );
};
