import { DayItemType } from '../lock/lock.type';

export interface StakingPool {
    id: number;
    title: string;
    description: string;
    lock: {
        logo: string;
        name: string;
        network: string;
        networkLogo: string;
        symbol: string;
    };
    earn: {
        logo: string;
        name: string;
        network: string;
        networkLogo: string;
        symbol: string;
    };
    totalStaked: number;
    symbol: string;
    fromAPR: number;
    toAPR: number;
    isActive: boolean;
    currentTVL: number;
    rewardLeft: number;
    adminAddress: string;
    minimum: number;
    tokenContractAddress: string;
    decimal: number;
    slip0044: number;
    isLocking: boolean;
    lockPeriod: DayItemType[];
}
