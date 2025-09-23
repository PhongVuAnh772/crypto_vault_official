import {
  StackActions,
  useNavigation,
  useNavigationState,
} from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import AppModal from "src/components/common/AppModal";
import { SwapRoundSvgIcon, TrashSvgIcon } from "src/core/constants/AppIconsSvg";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  getAccountDeactivate,
  getAccountDeleted,
  getAccountDeletedOnlyCreateAccountUtil30Days,
  setAccountDeactivate,
  setAccountDeleted,
  setAccountDeletedOnlyCreateAccountUtil30Days,
} from "src/core/redux/slice/rezPoint/rezPoint.slice";
import {
  HomeStackScreenKey,
  NavigationStackKey,
} from "src/navigation/enum/NavigationKey";

const AccountListener = () => {
  const isAccountDeactivate = useAppSelector(getAccountDeactivate);
  const isAccountDeleted = useAppSelector(getAccountDeleted);
  const isAccountDeletedOnlyCreateAccountUtil30Days = useAppSelector(
    getAccountDeletedOnlyCreateAccountUtil30Days
  );
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const theme = useAppTheme();

  const isBack = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.state?.routes ? route.state?.routes?.length > 1 : false;
  });

  const handleCloseDeactivate = () => {
    dispatch(setAccountDeactivate(false));
    if (isBack) {
      navigation.dispatch(StackActions.push(NavigationStackKey.HomeStack));
    }
  };

  const handleCloseDeleted = () => {
    dispatch(setAccountDeleted(false));
    if (isBack) {
      navigation.dispatch(StackActions.push(NavigationStackKey.HomeStack));
    }
  };
  const handleCloseDeletedOnlyCreateAccountUtil30Days = () => {
    dispatch(setAccountDeletedOnlyCreateAccountUtil30Days(false));
  };

  const handleNavigateToSupport = () => {
    dispatch(setAccountDeleted(false));
    dispatch(setAccountDeactivate(false));
    navigation.dispatch(
      StackActions.push(NavigationStackKey.HomeStack, {
        screen: HomeStackScreenKey.Contact,
      })
    );
  };
  if (isAccountDeleted) {
    return (
      <View>
        <AppModal
          titleWithI18n={LanguageKey.account_deleted}
          subTitleWithI18n={LanguageKey.account_deleted_sub_title}
          visible={isAccountDeleted}
          onPress={handleCloseDeleted}
          buttonTitleWithI18n={LanguageKey.common_close}
          icon={<TrashSvgIcon width={30} height={30} />}
          keepBottomButton={true}
        />
      </View>
    );
  }
  if (isAccountDeactivate) {
    return (
      <View>
        <AppModal
          titleWithI18n={LanguageKey.rez_point_deactivated}
          subTitleWithI18n={LanguageKey.rez_point_deactivate_sub_title}
          visible={isAccountDeactivate}
          onPress={handleNavigateToSupport}
          buttonTitleWithI18n={LanguageKey.setting_contact_support}
          icon={<SwapRoundSvgIcon />}
          keepBottomButton={true}
          twoOptions
          buttonTitleWithI18n2={LanguageKey.common_close}
          textButtonSecondColor={theme.colors.text_on_surface_text_brand_2}
          buttonSecondContainerStyle={{
            backgroundColor: theme.colors.surface_surface_high,
            borderColor: theme.colors.text_on_surface_text_brand_2,
            borderWidth: 0.5,
          }}
          onPress2={handleCloseDeactivate}
        />
      </View>
    );
  }
  if (isAccountDeletedOnlyCreateAccountUtil30Days) {
    return (
      <View>
        <AppModal
          titleWithI18n={LanguageKey.account_deleted}
          subTitleWithI18n={LanguageKey.account_deleted_sub_title_2}
          visible={isAccountDeletedOnlyCreateAccountUtil30Days}
          onPress={handleCloseDeletedOnlyCreateAccountUtil30Days}
          buttonTitleWithI18n={LanguageKey.common_close}
          icon={<TrashSvgIcon width={30} height={30} />}
          keepBottomButton={true}
        />
      </View>
    );
  }
  return null;
};

export default AccountListener;
