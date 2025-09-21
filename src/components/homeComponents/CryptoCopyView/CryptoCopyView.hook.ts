import {CoinType} from 'src/core/enum/CoinType';
import * as Clipboard from 'expo-clipboard';
import Utils from 'src/core/utils/commonUtils';
import AppToastType from 'src/core/enum/AppToastType';
import {useTranslation} from 'react-i18next';
import LanguageKey from 'src/core/locales/LanguageKey';

export type DataCryptoType = {
    type: CoinType;
    address: string;
};

const useCryptoCopyView = (
    list: DataCryptoType[],
    searching: string,
    actionHideModal: () => void,
) => {
    const {t} = useTranslation();

    const copyAction = (address: string) => {
        Clipboard.setStringAsync(address);
        actionHideModal();
        Utils.showToast({
            msg: t(LanguageKey.common_copied),
            type: AppToastType.success,
        });
    };

    const filteredData = list.filter(item => {
        return item.type.toLowerCase().includes(searching.toLowerCase());
    });

    const isEmptyData = filteredData.length === 0;

    return {
        filteredData,
        copyAction,
        isEmptyData,
    };
};

export default useCryptoCopyView;
