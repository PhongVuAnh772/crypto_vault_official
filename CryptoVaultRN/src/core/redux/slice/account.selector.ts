import { useMemo } from 'react';
import Slip0044 from 'src/core/enum/Slip0044';
import { useAppSelector } from '../hooks';
import {
    getAccountId,
    getAllAccount,
    getProtocolDataLists,
    getSelectedProtocolId,
} from './account.slice';
import { AddressListItemType } from './account.type';
import {
    defaultSettingCurrency,
    selectorSelectedCurrencySetting,
    selectorSettingCurrency,
} from './app.slice';
import { getThemeMode } from './app.selector';
import { getIsTestnet } from './app.selector';

export const useSelectedCurrencySetting = () => {
    const selectedCurrencySetting = useAppSelector(
        selectorSelectedCurrencySetting,
    );
    const settingCurrency = useAppSelector(selectorSettingCurrency);
    
    return useMemo(() => {
        let defaultCurrency = settingCurrency?.find(e =>
            e.symbol.toLocaleLowerCase().includes('jp'),
        );
        defaultCurrency =
            defaultCurrency ??
            (settingCurrency ? settingCurrency[0] : defaultSettingCurrency);
        if (selectedCurrencySetting) {
            return selectedCurrencySetting;
        } else {
            return defaultCurrency;
        }
    }, [selectedCurrencySetting, settingCurrency]);
};

export const useAccountProtocolSelected = () => {
    const accountLists = useAppSelector(getAllAccount);
    const selectAccountId = useAppSelector(getAccountId);
    const selectedProtocolId = useAppSelector(getSelectedProtocolId);
    
    return useMemo(() => {
        if (accountLists !== undefined) {
            const currentAccount = accountLists.find(
                e => e?.id === selectAccountId,
            );
            const protocolData = currentAccount?.protocolData;
            if (selectedProtocolId) {
                const selectedProtocol = (protocolData ?? []).find(
                    e => e?._id === selectedProtocolId,
                );
                return selectedProtocol;
            }
        }
        return undefined;
    }, [accountLists, selectAccountId, selectedProtocolId]);
};
export const useWalletData = (id: string, address: string) => {
    const accountLists = useAppSelector(getAllAccount);
    const selectAccountId = useAppSelector(getAccountId);
    if (accountLists !== undefined) {
        const currentAccount = [...accountLists].find(
            e => e?.id === selectAccountId,
        );
        const protocolData = currentAccount?.protocolData;
        const selectedProtocol = [...(protocolData ?? [])].find(
            e => e?._id === id,
        );
        const addressData = selectedProtocol?.addressList.find(
            e => e.address === address,
        );
        return addressData;
    }
};
export const useProtocolSelected = () => {
    const protocolDataLists = useAppSelector(getProtocolDataLists);
    const selectedProtocolId = useAppSelector(getSelectedProtocolId);
    const isTestnet = useAppSelector(getIsTestnet);
    return protocolDataLists?.find(e => {
        if (selectedProtocolId) {
            return e?._id === selectedProtocolId;
        } else {
            return e.slip0044 === Slip0044.Polygon && (!!e.isTestnet === !!isTestnet);
        }
    }) || protocolDataLists?.find(e => e.slip0044 === Slip0044.Polygon);
};

export const useCurrentWallet = (): AddressListItemType | undefined => {
    const accountLists = useAppSelector(getAllAccount);
    const selectedProtocolId = useAppSelector(getSelectedProtocolId);
    const selectAccountId = useAppSelector(getAccountId);
    const protocolDataLists = useAppSelector(getProtocolDataLists);

    return useMemo(() => {
        if (accountLists !== undefined) {
            const accountWallet = accountLists.find(
                e => e?.id === selectAccountId,
            );
            if (!accountWallet) {
                return undefined;
            }

            const { protocolData } = accountWallet;
            const currentProtocol =
                protocolData?.find(e => e?._id === selectedProtocolId) ||
                protocolData?.find(e =>
                    (protocolDataLists || []).some(p => p._id === e._id),
                ) ||
                protocolData?.[0];

            if (!currentProtocol) {
                return undefined;
            }
            const { addressList, selectedAddressId } = currentProtocol;
            const addRessData = addressList.find(e => e.id === selectedAddressId);

            if (!addRessData) {
                return undefined;
            }
            return addRessData;
        }
        return undefined;
    }, [accountLists, selectedProtocolId, selectAccountId, protocolDataLists]);
};

export const useAccount = () => {
    const accountLists = useAppSelector(getAllAccount);
    const selectAccountId = useAppSelector(getAccountId);
    return useMemo(() => {
        if (accountLists !== undefined) {
            const accountWallet = accountLists.find(
                e => e?.id === selectAccountId,
            );
            return accountWallet;
        }
        return undefined;
    }, [accountLists, selectAccountId]);
};

export const useMnemonic = () => {
    const currentAccount = useAccount();
    return currentAccount?.mnemonic;
};

const useAddressDataWithSlip0044 = (slip0044: Slip0044) => {
    const protocolListData = useAppSelector(getProtocolDataLists);
    const currentAccount = useAccount();
    const isTestnet = useAppSelector(getIsTestnet);

    return useMemo(() => {
        const protocolsBySlip = (protocolListData || []).filter(
            e => e.slip0044 === slip0044,
        );
        const coinProtocolData =
            protocolsBySlip.find(e => !!e.isTestnet === !!isTestnet) ||
            protocolsBySlip[0];

        const accountProtocolListData = currentAccount?.protocolData;

        const coinAccountData = accountProtocolListData?.find(
            e => e._id === coinProtocolData?._id,
        );
        const polAddressList = coinAccountData?.addressList;
        const selectedAddressId = coinAccountData?.selectedAddressId;
        const currentCoinAddressData = polAddressList?.find(
            e => e.id === selectedAddressId,
        );

        return currentCoinAddressData;
    }, [protocolListData, currentAccount, slip0044, isTestnet]);
};

export const usePolAddressData = () => {
    return useAddressDataWithSlip0044(Slip0044.Polygon)?.address;
};

export const useTonAddressData = () => {
    return useAddressDataWithSlip0044(Slip0044.Ton);
};
export const useBitcoinAddressData = () => {
    return useAddressDataWithSlip0044(Slip0044.Bitcoin);
};
export const useCurrencyRateConversion = () => {
    const currencyUSD = useAppSelector(selectorSettingCurrency);
    const usd = currencyUSD?.find(item => item.symbol === 'USD');
    const euro = currencyUSD?.find(item => item.symbol === 'EUR');

    if (usd && euro) {
        return euro.rate / usd.rate;
    }
    return 1;
};
