import { useMemo } from 'react';
import VMType from '../enum/VMType';
import { useAppSelector } from '../redux/hooks';
import { useSelectedCurrencySetting } from '../redux/slice/account.selector';
import { ProtocolDataWithSupportedTokensFormBEType } from '../redux/slice/account.type';
import { selectorSettingCurrency } from '../redux/slice/app.slice';

export const useCurrencyRateConversion = () => {
    const currencies = useAppSelector(selectorSettingCurrency);
    const currencySelected = useSelectedCurrencySetting();

    const usdCurrency = useMemo(() => {
        return currencies?.find(item => item.symbol === 'USD');
    }, [currencies]);

    const euroCurrency = useMemo(
        () => currencies?.find(item => item.symbol === 'EUR'),
        [currencies],
    );

    const getRate = (
        protocolData: ProtocolDataWithSupportedTokensFormBEType,
    ) => {
        if (!currencySelected || !usdCurrency || !euroCurrency) {
            return {
                rate: 1,
                sign: '',
                symbol: '',
            };
        }
        const { rate, sign, symbol } = currencySelected;

        let finalRate = euroCurrency.rate / usdCurrency.rate;

        // because EVM base on USD
        if (protocolData.VM === VMType.EVM) {
            finalRate = rate * (euroCurrency.rate / usdCurrency.rate);
        } else {
            finalRate = rate;
        }
        return {
            rate: finalRate,
            sign,
            symbol,
        };
    };

    return {
        getRate,
    };
};
