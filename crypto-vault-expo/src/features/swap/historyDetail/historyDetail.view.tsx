import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SvgUri } from 'react-native-svg';
import { ScreenWrapper } from 'src/components';
import AppText from 'src/components/common/AppText';
import SeparatorLine from 'src/components/specific/SeparatorLine';
import appColors from 'src/core/constants/AppColors';
import { SwapSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import ButtonBottom from 'src/components/specific/ButtonBottom';
import RowItem from 'src/components/specific/RowItem';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    getBackgroundColorSwapHistoryDetail,
    getIconSwapHistoryDetail,
    getTextByStatus,
    getTextColorStyleSwapHistoryDetail,
} from '../index.utils';
import useHistoryDetailTransaction from './historyDetail.hook';
import useStyle from './historyDetail.styles';

const TransactionHistorySwapDetailView: React.FC<RootNavigationType> = ({
    navigation,
}) => {
    const styles = useStyle();
    const { t } = useTranslation();
    const { handleClose, transactionData } = useHistoryDetailTransaction({
        navigation,
    });

    return (
        <ScreenWrapper
            paddingTop
            backgroundColor={appColors.main.tokyoRed}
            backButtonColor={appColors.neutral.white}
            headerTextColor={appColors.neutral.white}
            enableHeader
            bounces={false}
            headerTitleWithI18n={LanguageKey.home_swap_title}
            scrollEnabled
            backAction={handleClose}>
            <View style={styles.container}>
                <View style={appStyles.center}>
                    {getIconSwapHistoryDetail(transactionData.status)}
                    <View
                        style={[
                            styles.statusView,
                            {
                                backgroundColor:
                                    getBackgroundColorSwapHistoryDetail(
                                        transactionData.status,
                                    ),
                            },
                        ]}>
                        <AppText
                            titleWithI18n={getTextByStatus(
                                transactionData.status,
                            )}
                            textColor={getTextColorStyleSwapHistoryDetail(
                                transactionData.status,
                            )}
                            variant={TextVariantKeys.labelSmall}
                        />
                    </View>
                </View>

                <View style={[appStyles.mt20, styles.boxContainer]}>
                    {transactionData?.swapFrom && transactionData?.swapTo && (
                        <View
                            style={[
                                appStyles.ph12,
                                appStyles.pB15,
                                appStyles.pT25,
                                appStyles.flexRow,
                                appStyles.alignItemsCenter,
                                appStyles.justifyContentBetween,
                            ]}>
                            <AppText
                                titleWithI18n={LanguageKey.home_swap_title}
                                textColor={appColors.neutral.n600}
                                variant={TextVariantKeys.bodyMLarge}
                            />

                            <View
                                style={[
                                    appStyles.flexRow,
                                    appStyles.alignItemsCenter,
                                    appStyles.justifyContentBetween,
                                ]}>
                                <View style={appStyles.iconCircleSize24}>
                                    <SvgUri
                                        uri={transactionData?.swapFrom}
                                        width={24}
                                        height={24}
                                    />
                                </View>
                                <View style={styles.iconSwap}>
                                    <SwapSvgIcon width={16} height={16} />
                                </View>
                                <View style={appStyles.iconCircleSize24}>
                                    <SvgUri
                                        uri={transactionData?.swapTo}
                                        width={24}
                                        height={24}
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    <SeparatorLine />

                    <FlatList
                        data={transactionData.rows}
                        renderItem={({ item }) => (
                            <RowItem title={t(item.title)} value={item.value} />
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

export default TransactionHistorySwapDetailView;
