import {Address, Cell, ContractProvider, Sender} from '@ton/core';

type BaseTransaction = {
    provider: ContractProvider;
    via: Sender;
};

export type Transfer = BaseTransaction & {
    value: bigint;
    toAddress: Address;
    fwdAmount: bigint;
    jettonAmount: bigint;
    fwdPayload: Cell;
    queryId?: number;
};

export type sendAddRewards = BaseTransaction & {
    stakingAddress: Address;
    rewardsAmount: bigint;
    queryId?: number;
};

export type Stake = BaseTransaction & {
    stakingAddress: Address;
    stakeAmount: bigint;
    stakePeriod: number;
    queryId?: number;
};
