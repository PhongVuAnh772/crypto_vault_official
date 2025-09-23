import React from "react";
import { FlatList, KeyboardAvoidingView, View } from "react-native";
import { TextInput } from "react-native-paper";
import AppButton from "src/components/common/AppButton";
import { AppShowView } from "src/components/common/AppShowView";
import AppText from "src/components/common/AppText";
import RequirePinCodeLayout from "src/components/layout/RequirePinCode/requirePinCode.view";
import ScreenWrapper from "src/components/layout/ScreenWrapper";
import appColors from "src/core/constants/AppColors";
import InputMode from "src/core/enum/InputMode";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import Utils from "src/core/utils/commonUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import ButtonBottom from "../components/buttonBottom";
import DaysItem from "../components/daysItem";
import RowItem from "../components/rowItem";
import { BottomConfirmation, SeparatorList } from "./lock.components";
import useLock from "./lock.hook";
import useStyle from "./style";

const LockView: React.FC<RootNavigationType> = (navigation) => {
  const insets = useAppSafeAreaInsets();
  const theme = useAppTheme();

  const {
    currentDays,
    setCurrentDays,
    refModalConfirmation,
    currentLockAmount,
    isShowLockOverview,
    stakingPoolData,
    listPeriod,
    overviewStaking,
    networkFeeValueString,
    handleOnClickLock,
    pageLoading,
    isDisabledLock,
    t,
    errorTransaction,
    isShowPinCode,
    handleShowPinCode,
    handleClosePinCode,
    progressMakeTransaction,
    balance,
    handleGetMaxBalance,
    handleChangeAmount,
    disableScreen,
    showBalance,
  } = useLock(navigation);

  const style = useStyle(theme, insets);
  return (
    <>
      <ScreenWrapper
        enableHeader
        paddingTop
        headerTitle={t(LanguageKey.stake_lock_redx, {
          name: stakingPoolData.lock.name,
        })}
        headerTextVariant={TextVariantKeys.titleLarge}
        backgroundColor={theme.colors.surface_surface_default}
        enableDismissKeyboard
      >
        <KeyboardAvoidingView behavior="padding" style={[appStyles.flex1]}>
          <View style={style.boxContainerView}>
            <View
              style={[
                appStyles.flexRow,
                appStyles.justifyContentBetween,
                appStyles.alignItemsCenter,
              ]}
            >
              <AppText
                titleWithI18n={LanguageKey.common_text_lock_amount}
                variant={TextVariantKeys.bodyMSmall}
                textColor={theme.colors.text_on_surface_text_medium}
              />
              <View
                style={[
                  appStyles.flexRow,
                  appStyles.justifyContentEnd,
                  appStyles.alignItemsCenter,
                ]}
              >
                <View style={[appStyles.mr5]}>
                  <AppText
                    titleWithI18n={LanguageKey.send_lock_maximum_title}
                    variant={TextVariantKeys.bodyMSmall}
                    textColor={appColors.main.tokyoRed}
                    styles={appStyles.textAlignRight}
                  />
                  <AppText
                    title={!balance ? showBalance : `≈ ${showBalance}`}
                    textColor={appColors.main.tokyoRed}
                    styles={appStyles.textAlignRight}
                  />
                </View>
              </View>
            </View>
            <View style={[appStyles.flexRow, style.inputAmount, appStyles.mt5]}>
              <TextInput
                readOnly={
                  disableScreen || pageLoading.confirmation || pageLoading.lock
                }
                keyboardType="numeric"
                dense={false}
                onChangeText={handleChangeAmount}
                clearButtonMode="while-editing"
                value={currentLockAmount}
                mode={InputMode.outlined}
                outlineColor={theme.colors.surface_surface_high}
                activeOutlineColor={theme.colors.surface_surface_high}
                selectionColor={appColors.neutral.black}
                outlineStyle={style.inputAmountOutline}
                numberOfLines={1}
                textColor={
                  false
                    ? appColors.main.tokyoRed
                    : theme.colors.text_on_surface_text_high
                }
                style={[
                  style.inputAmountContainer,
                  currentLockAmount
                    ? { ...theme.fonts.titleSmall }
                    : { ...theme.fonts.bodyRMedium },
                ]}
                contentStyle={style.contentStyleInput}
                placeholder={`${t(LanguageKey.common_text_minimum)} ${stakingPoolData.minimum}`}
                cursorColor={appColors.neutral.black}
              />
              <View style={style.currencyText}>
                <AppButton
                  titleWithI18n={LanguageKey.common_text_max}
                  textVariant={TextVariantKeys.bodyMMedium}
                  textColor={appColors.main.tokyoRed}
                  onPress={handleGetMaxBalance}
                  onlyDisabled={
                    disableScreen ||
                    pageLoading.confirmation ||
                    pageLoading.lock
                  }
                />
              </View>
              <View style={[style.currencyText, appStyles.pR15]}>
                <AppText
                  title={stakingPoolData.lock.name}
                  variant={TextVariantKeys.titleMedium}
                  textColor={theme.colors.text_on_surface_text_high}
                />
              </View>
            </View>
            <View style={[appStyles.mt25]}>
              <AppText
                titleWithI18n={LanguageKey.common_text_lock_period}
                variant={TextVariantKeys.bodyMSmall}
                textColor={theme.colors.text_on_surface_text_medium}
              />
              <FlatList
                data={listPeriod}
                renderItem={({ item, index }) => {
                  return (
                    <DaysItem
                      days={t(LanguageKey.stake_day, {
                        days: item.value,
                      })}
                      onPress={() => setCurrentDays(item)}
                      isSelected={item.value === currentDays?.value}
                      index={index}
                      disable={
                        disableScreen ||
                        pageLoading.confirmation ||
                        pageLoading.lock
                      }
                    />
                  );
                }}
                keyExtractor={(_, index) => index.toString()}
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                numColumns={3}
                horizontal={false}
                ItemSeparatorComponent={SeparatorList}
                style={[appStyles.mt5]}
              />
            </View>

            <View>
              <AppShowView
                isShow={isShowLockOverview}
                containerStyle={appStyles.flex0}
              >
                <View style={[appStyles.mt25]}>
                  <AppText
                    titleWithI18n={LanguageKey.common_text_lock_overview}
                    variant={TextVariantKeys.bodyMSmall}
                    textColor={theme.colors.text_on_surface_text_medium}
                  />
                  <View style={[appStyles.mt10, style.lockOverview]}>
                    <RowItem
                      title={t(LanguageKey.common_text_reward)}
                      value={`${Utils.formattedBalanceCurrency(overviewStaking.reward)} ${stakingPoolData.earn.name}`}
                    />
                    <RowItem
                      title={t(LanguageKey.common_text_amount_to_be_locked)}
                      value={`${currentLockAmount} ${stakingPoolData.lock.name}`}
                    />
                    <RowItem
                      title={t(LanguageKey.common_text_apr)}
                      value={`${overviewStaking.apr}%`}
                    />
                    <RowItem
                      title={t(LanguageKey.common_text_lock_period)}
                      value={currentDays?.title || ""}
                    />
                  </View>
                </View>
              </AppShowView>
              <View
                style={[
                  appStyles.mt10,
                  isShowLockOverview
                    ? appStyles.positionRelative
                    : appStyles.positionAbsolute,
                ]}
              >
                {!!errorTransaction && (
                  <AppText
                    title={errorTransaction}
                    textColor={appColors.main.tokyoRed}
                  />
                )}
              </View>
            </View>
          </View>
          <ButtonBottom
            onPress={handleOnClickLock}
            title={t(LanguageKey.stake_lock_redx, {
              name: stakingPoolData.lock.name,
            })}
            isLoading={pageLoading.lock}
            disabled={!isDisabledLock || !!errorTransaction || disableScreen}
            containerStyle={style.buttonContainer}
          />
        </KeyboardAvoidingView>
      </ScreenWrapper>

      <BottomConfirmation
        refModal={refModalConfirmation}
        onPress={handleShowPinCode}
        lockAmount={`${Utils.formattedBalanceCurrency(
          Number(currentLockAmount)
        )} ${stakingPoolData.lock.name}`}
        lockPeriod={currentDays?.title || ""}
        smartContractAddress={""}
        gasFee={networkFeeValueString}
      />
      <RequirePinCodeLayout
        onClose={handleClosePinCode}
        visible={isShowPinCode}
        continueActionAfterPassPinCode={progressMakeTransaction}
      />
    </>
  );
};

export default LockView;
