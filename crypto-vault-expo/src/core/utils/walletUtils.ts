import moment from 'moment';
import { CoinShortName } from '../enum/CoinShortName';
import { CoinType } from '../enum/CoinType';
import { ProtocolType } from '../enum/ProtocolType';
import { HistorySectionDataType } from '../type/HistorySectionDataType';
import { TransactionHistoryDataType } from '../type/TransactionHistoryDataType';

const _groupByDate = (
    data: TransactionHistoryDataType[],
): Record<string, TransactionHistoryDataType[]> => {
    return data.reduce<Record<string, TransactionHistoryDataType[]>>(
        (acc, item) => {
            const date = moment(item.createdAt).local().format('M-D-YYYY');
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        },
        {},
    );
};

const _transformToSections = (
    groupedData: Record<string, TransactionHistoryDataType[]>,
): HistorySectionDataType[] => {
    return Object.keys(groupedData).map(date => {
        const formattedDate = moment(date, 'M-D-YYYY').format('MMM DD, YYYY');
        return {
            title: formattedDate,
            data: groupedData[date],
        };
    });
};

const transactionHistoryTransformToSectionsData = (
    transactionHistory: TransactionHistoryDataType[],
): HistorySectionDataType[] => {
    const groupedData = _groupByDate(transactionHistory);
    return _transformToSections(groupedData);
};

const getByteFeeFromFeePerKb = (fee_per_kb?: number) => {
    try {
        const result = Math.ceil(
            fee_per_kb !== undefined ? fee_per_kb / 1000 : 1,
        );
        return result < 1 ? 1 : result;
    } catch (error) {
        console.error('getByteFeeFromFeePerKb error', error);
        return 1;
    }
};

const getShortAddress = (address?: string,startText?:number) => {
    if (address && address.length > 17) {
        return address.slice(0, startText??4) + '...' + address?.slice(-4);
    } else {
        return address ?? '';
    }
};

const getShortMoreAddress = (address?: string) => {
    if (address && address.length > 17) {
        return address.slice(0, 3) + '...' + address?.slice(-3);
    } else {
        return address ?? '';
    }
};
const getShortAddressEnd = (address?: string) => {
    return address ? address.slice(0, 23) + '...' : '';
};

const getCrytoDataFromType = (
    crytoType: CoinType | ProtocolType,
): {name: CoinType | ProtocolType; shortName: CoinShortName} => {
    switch (crytoType) {
        case CoinType.Bitcoin:
            return {name: CoinType.Bitcoin, shortName: CoinShortName.BTC};
        case CoinType.Ethereum:
            return {name: CoinType.Ethereum, shortName: CoinShortName.ETH};
        case CoinType.Ton:
            return {name: CoinType.Ton, shortName: CoinShortName.TON};
        default:
            return {name: CoinType.Bitcoin, shortName: CoinShortName.BTC};
    }
};

const WalletUtils = {
    transactionHistoryTransformToSectionsData,
    getByteFeeFromFeePerKb,
    getShortAddress,
    getShortAddressEnd,
    getCrytoDataFromType,
    getShortMoreAddress,
};
export default WalletUtils;
