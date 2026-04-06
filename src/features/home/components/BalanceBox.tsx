import AppText from 'components/AppText';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useSelectedCurrencySetting } from 'src/core/redux/slice/account.selector';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';

type WalletAcBalanceRedXProps = {
    balance: number;
    withoutCurrencyRate: boolean;
};
const BalanceCard: React.FC<WalletAcBalanceRedXProps> = ({
    withoutCurrencyRate,
    balance,
}) => {
    const theme = useAppTheme();
    const selectedCurrencySetting = useSelectedCurrencySetting();
    const balanceConverted = `${selectedCurrencySetting?.sign ?? ''} ${Utils.fiatFormat(balance * (withoutCurrencyRate ? 1 : selectedCurrencySetting?.rate))}`;
    const ViewBalanceRedX: React.FC = () => {
        return (
          <View style={[appStyles.mt60,appStyles.ml30]}>
            <AppText
              title={balanceConverted}
              variant={TextVariantKeys.headlineMedium}
              textColor={theme.colors.text_on_surface_text_invert}
              numberOfLines={1}
              maxFontSizeMultiplier={1.4}
            />
          </View>
        );
    };
    return (
      <ImageBackground
        source={appImages.fgCard}
        imageStyle={styles.imageBackgroundRedXBalance}
        style={[styles.imageBackgroundRedXBalanceContainer]}
        resizeMode="contain"
      >
        <ViewBalanceRedX />
      </ImageBackground>
    );
    
};
const styles = StyleSheet.create({
  imageBackgroundRedXBalance: {
    width: "100%",
  },
  imageBackgroundRedXBalanceContainer: {
    width: '100%',
    height: 250,
  },
});

export default BalanceCard;
