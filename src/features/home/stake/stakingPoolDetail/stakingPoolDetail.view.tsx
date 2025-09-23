import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ScreenWrapper } from "src/components";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import Utils from "src/core/utils/commonUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import ButtonBottom from "../components/buttonBottom";
import CardInformation from "../components/cardInformation";
import CardTransfer from "../components/cardTransfer";
import MyStaking from "../components/myStaking";
import RowsView from "../components/rowsView";
import useStakingPoolDetail from "./stakingPoolDetail.hook";
import style from "./style";

const StakingPoolDetailView: React.FC<RootNavigationType> = (navigation) => {
  const { t } = useTranslation();

  const {
    handleNavigateToLock,
    stakingPoolData,
    totalMyStaking,
    showMyStaking,
    listMyStaking,
    handleNavigateToStakingDetail,
    insets,
    lockAPYShow,
  } = useStakingPoolDetail(navigation);

  return (
    <>
      <ScreenWrapper
        paddingTop
        backgroundColor={appColors.neutral.n100}
        enableHeader
        headerTitleWithI18n={t(LanguageKey.common_text_jetton_pool)}
        scrollEnabled
        subStyle={[
          appStyles.flex1,
          {
            paddingBottom: stakingPoolData?.isLocking ? 60 + insets.bottom : 0,
          },
        ]}
      >
        <View style={style.container}>
          <AppText
            title={t(LanguageKey.stake_staking_pool_title, {
              earn_name: stakingPoolData.earn.name,
              lock_name: stakingPoolData.lock.name,
            })}
            variant={TextVariantKeys.titleLarge}
            textColor={appColors.neutral.black}
          />
          <CardInformation
            description={stakingPoolData.description}
            totalAmount={Utils.formattedBalanceCurrency(
              stakingPoolData.totalStaked
            )}
            symbol={stakingPoolData.symbol}
            containerStyle={style.cardContainer}
            titleGift={t(LanguageKey.common_text_reward)}
            customTitleGift={`: ${Utils.formattedBalanceCurrency(
              stakingPoolData.rewardLeft
            )}/${Utils.formattedBalanceCurrency(
              stakingPoolData.totalStaked
            )} ${stakingPoolData.symbol}`}
          />
          <View style={appStyles.mt15}>
            <View style={style.cardTransferContainer}>
              <CardTransfer
                lockInfo={{
                  nameToken: stakingPoolData.lock.name,
                  nameProtocol: stakingPoolData.lock.network,
                  imageToken: stakingPoolData.lock.logo,
                  imageProtocol: stakingPoolData.lock.networkLogo,
                }}
                earnInfo={{
                  nameToken: stakingPoolData.earn.name,
                  nameProtocol: stakingPoolData.earn.network,
                  imageToken: stakingPoolData.earn.logo,
                  imageProtocol: stakingPoolData.earn.networkLogo,
                }}
              />
            </View>
            <RowsView
              data={[
                {
                  title: t(LanguageKey.common_text_apr),
                  value: lockAPYShow,
                },
                {
                  title: t(LanguageKey.common_text_tvl),
                  value: `${Utils.formattedBalanceCurrency(
                    stakingPoolData.currentTVL
                  )} ${stakingPoolData.symbol}`,
                },
                {
                  title: t(LanguageKey.common_text_rewards_left),
                  value: `${Utils.formattedBalanceCurrency(
                    stakingPoolData.rewardLeft
                  )} ${stakingPoolData.symbol}`,
                },
              ]}
            />
            {!!showMyStaking && (
              <View style={appStyles.mt20}>
                <MyStaking
                  stakingAmount={`${Utils.formattedBalanceCurrency(
                    totalMyStaking
                  )} ${stakingPoolData.symbol}`}
                  onPress={handleNavigateToStakingDetail}
                  data={listMyStaking}
                />
              </View>
            )}
          </View>
        </View>
      </ScreenWrapper>
      {stakingPoolData?.isLocking ? (
        <ButtonBottom
          onPress={handleNavigateToLock}
          title={t(LanguageKey.stake_lock_redx, {
            name: stakingPoolData.lock.name,
          })}
        />
      ) : null}
    </>
  );
};

export default StakingPoolDetailView;
