import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import AppText from 'src/components/common/AppText';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import appColors from 'src/core/constants/AppColors';
import {
    CalendarLockSvgIcon,
    WalletChangeSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import ButtonBottom from '../components/buttonBottom';
import RowItem from '../components/rowItem';
import Separator from '../components/separator';
import useStyle from './style';

const SeparatorList = () => <Separator height={10} />;

type BottomConfirmationType = {
    refModal: React.RefObject<BottomSheetModalMethods>;
    onPress: () => void;
    lockAmount: string;
    lockPeriod: string;
    smartContractAddress: string;
    gasFee: string;
    children?: React.ReactNode;
};
const BottomConfirmation = ({
    refModal,
    onPress,
    lockAmount,
    lockPeriod,
    smartContractAddress,
    gasFee,
    children,
}: BottomConfirmationType) => {
    const theme = useAppTheme();
    const styles = useStyle(theme);
    const { t } = useTranslation();
    return (
        <BottomSheetModalGorhom refModal={refModal}>
            <View style={[appStyles.flex1, appStyles.pH25, appStyles.pT10]}>
                <AppText
                    titleWithI18n={LanguageKey.common_text_confirmation}
                    variant={TextVariantKeys.titleLarge}
                    textColor={appColors.neutral.black}
                    styles={appStyles.textAlignCenter}
                />
                <View style={[appStyles.mt25, appStyles.flexRow]}>
                    <View style={[styles.boxContainer]}>
                        <View
                            style={[
                                appStyles.flexRow,
                                appStyles.alignItemsCenter,
                                appStyles.mbt10,
                            ]}>
                            <WalletChangeSvgIcon
                                color={appColors.neutral.n500}
                            />
                            <View style={[appStyles.ml10]}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.common_text_lock_amount
                                    }
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={appColors.neutral.n500}
                                />
                            </View>
                        </View>
                        <AppText
                            title={lockAmount}
                            variant={TextVariantKeys.titleMedium}
                            textColor={appColors.neutral.black}
                        />
                    </View>
                    <View style={styles.separator} />
                    <View style={[styles.boxContainer]}>
                        <View
                            style={[
                                appStyles.flexRow,
                                appStyles.alignItemsCenter,
                                appStyles.mbt10,
                            ]}>
                            <CalendarLockSvgIcon
                                color={appColors.neutral.n500}
                            />
                            <View style={[appStyles.ml10]}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.common_text_lock_period
                                    }
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={appColors.neutral.n500}
                                />
                            </View>
                        </View>
                        <AppText
                            title={lockPeriod}
                            variant={TextVariantKeys.titleMedium}
                            textColor={appColors.neutral.black}
                        />
                    </View>
                </View>
                <View style={appStyles.mt15}>
                    {!!smartContractAddress && (
                        <RowItem
                            title={t(
                                LanguageKey.common_text_smart_contract_address,
                            )}
                            value={smartContractAddress}
                            containerStyle={appStyles.pH0}
                        />
                    )}
                    {!!gasFee && (
                        <RowItem
                            title={t(LanguageKey.nft_estimate_gas_fee)}
                            value={gasFee}
                            containerStyle={[appStyles.pH0, appStyles.pV10]}
                        />
                    )}
                </View>
                <ButtonBottom
                    onPress={onPress}
                    title={t(LanguageKey.common_text_confirm)}
                    containerStyle={appStyles.backgroundTransparent}
                />
            </View>
            {children}
        </BottomSheetModalGorhom>
    );
};
export { BottomConfirmation, SeparatorList };
