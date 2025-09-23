import { useRoute } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { ScreenWrapper } from "src/components";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import { DepositSuccessSvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import ButtonBottom from "../components/buttonBottom";
import RowItem from "../components/rowItem";
import useStakingTransaction from "./stakingTransaction.hook";
import {
  StakingTransactionParams,
  StakingTransactionViewProps,
} from "./stakingTransaction.type";
import useStyle from "./style";

const StakingTransactionView: React.FC<RootNavigationType> = (navigation) => {
  const styles = useStyle();
  const { t } = useTranslation();
  const transactionData: StakingTransactionParams =
    useRoute<StakingTransactionViewProps>().params;
  const { handleClose } = useStakingTransaction(navigation);

  return (
    <ScreenWrapper
      paddingTop
      backgroundColor={appColors.neutral.n100}
      enableHeader
      bounces={false}
      headerTitleWithI18n={LanguageKey.common_text_staking_deposit}
      scrollEnabled
    >
      <View style={style.container}>
        <DepositSuccessSvgIcon />
        <View>
          <AppText
            titleWithI18n={LanguageKey.common_text_staked_deposit}
            variant={TextVariantKeys.titleMedium}
            textColor={appColors.neutral.black}
          />
        </View>
        <View style={appStyles.mt10}>
          <AppText
            title={transactionData.lockAmount}
            variant={TextVariantKeys.headlineSmall}
            textColor={appColors.main.tokyoRed}
          />
          {transactionData.lockAmountCurrency ? (
            <AppText
              title={`≈ ${transactionData.lockAmountCurrency}`}
              variant={TextVariantKeys.bodyMMedium}
              textColor={appColors.neutral.n500}
              styles={appStyles.textAlignCenter}
            />
          ) : null}
        </View>
        <View style={[appStyles.mt20, styles.boxContainer]}>
          <FlatList
            data={transactionData.data1}
            renderItem={({ item }) => (
              <RowItem title={t(item.title)} value={item.value} />
            )}
            scrollEnabled={false}
          />
        </View>
        <View style={[appStyles.mt20, styles.boxContainer]}>
          <FlatList
            data={transactionData.data2}
            renderItem={({ item }) => (
              <RowItem
                title={t(item.title)}
                value={item.value}
                value2={item.value2}
              />
            )}
            scrollEnabled={false}
          />
        </View>
        <ButtonBottom
          title={t(LanguageKey.common_close)}
          onPress={handleClose}
        />
      </View>
    </ScreenWrapper>
  );
};

const style = StyleSheet.create({
  container: {
    ...appStyles.flex1,
    ...appStyles.alignItemsCenter,
    ...appStyles.pH25,
    ...appStyles.pT30,
    ...appStyles.pB8,
    backgroundColor: appColors.neutral.n100,
  },
});
export default StakingTransactionView;
