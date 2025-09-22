import { StakingPool } from 'src/features/home/stake/types';

export type StakingStateType = {
    stakingPools: StakingPool[];

    stakingHistory: {
        [idAccount: string]: {
            [walletAddressAndSlip0044: string]: StakingHistoryItem[];
        };
    };
};
export type StakingHistoryItem = {
    reward: string;
    walletAddress: string;
    lockedDate: string;
    unClockOn: string;
    estimateGasFee: string;
    lockAmount: string;
    apr: string;
    adminAddress: string;
    lockPeriod: string;
};
export type SaveStakingHistory = {
    idAccount: string;
    walletAddressAndSlip0044: string;
    data: StakingHistoryItem;
};
