import {useSelector} from 'react-redux';
import {
    selectorListCryptoData,
    selectorSelectedCryptoDataId,
} from './home.slice';

export const useSelectorSelectedCryptoData = () => {
    const listCryptoData = useSelector(selectorListCryptoData);
    const selectedCryptoDataId = useSelector(selectorSelectedCryptoDataId);
    return listCryptoData?.find(e => e.id === selectedCryptoDataId);
};
