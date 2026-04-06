import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useSelectedCurrencySetting } from 'src/core/redux/slice/account.selector';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';

type WalletAcBalanceRedXProps = {
    balance: number;
    withoutCurrencyRate: boolean;
};
const BalanceRedX: React.FC<WalletAcBalanceRedXProps> = ({
    withoutCurrencyRate,
    balance,
}) => {
    const theme = useAppTheme();
    const selectedCurrencySetting = useSelectedCurrencySetting();
    const balanceConverted = `${selectedCurrencySetting?.sign ?? ''} ${Utils.fiatFormat(balance * (withoutCurrencyRate ? 1 : selectedCurrencySetting?.rate))}`;
    const ViewBalanceRedX: React.FC = () => {
        return (
            <>
                <AppText
                    titleWithI18n={LanguageKey.common_red_x_balance}
                    variant={TextVariantKeys.bodyRTiny}
                    textColor={theme.colors.text_on_surface_text_invert}
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.4}
                />
                <View style={appStyles.mt5}>
                    <AppText
                        title={balanceConverted}
                        variant={TextVariantKeys.titleMedium}
                        textColor={theme.colors.text_on_surface_text_invert}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.4}
                    />
                </View>
            </>
        );
    };
    return <ImageBackground
            source={appImages.RedXBalanceBackground}
            imageStyle={styles.imageBackgroundRedXBalance}
            style={[styles.imageBackgroundRedXBalanceContainer]}>
            <ViewBalanceRedX />
        </ImageBackground>
    
};
const styles = StyleSheet.create({
    imageBackgroundRedXBalance: {
        flex: 61,
        borderRadius: 4,
    },
    imageBackgroundRedXBalanceContainer: {
        flex: 61,
        borderRadius: 4,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
        paddingVertical: 16,
        backgroundColor:  undefined,
    },
});

export default BalanceRedX;
