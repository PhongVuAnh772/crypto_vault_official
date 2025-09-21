import {
    Address,
    beginCell,
    Cell,
    Contract,
    ContractProvider,
    Sender,
    SendMode,
} from '@ton/core';
import {Gas, Opcodes} from '../constants';
import {Transfer} from '../types/jettonWallet';

export class JettonWallet implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: {code: Cell; data: Cell},
    ) {}

    static createFromAddress(address: Address) {
        return new JettonWallet(address);
    }

    async getJettonBalance(provider: ContractProvider) {
        let state = await provider.getState();
        if (state.state.type !== 'active') {
            return 0n;
        }
        let res = await provider.get('get_wallet_data', []);
        return res.stack.readBigNumber();
    }

    private async sendTransfer({
        provider,
        via,
        value,
        toAddress,
        fwdAmount,
        jettonAmount,
        fwdPayload,
        queryId,
    }: Transfer) {
        await provider.internal(via, {
            value: value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0xf8a7ea5, 32)
                .storeUint(queryId ?? 0, 64)
                .storeCoins(jettonAmount)
                .storeAddress(toAddress)
                .storeAddress(via.address)
                .storeUint(0, 1)
                .storeCoins(fwdAmount)
                .storeUint(1, 1)
                .storeRef(fwdPayload)
                .endCell(),
        });
    }

    async sendUnStake(
        provider: ContractProvider,
        via: Sender,
        queryId?: number,
    ) {
        await provider.internal(via, {
            value: Gas.withdraw_nft,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.withdraw_nft, 32)
                .storeUint(queryId ?? 0, 64)
                .endCell(),
        });
    }

    async sendStake(
        provider: ContractProvider,
        via: Sender,
        stakingAddress: Address,
        stakeAmount: bigint,
        stakePeriod: number,
        queryId?: number,
    ) {
        let forwardPayload = beginCell().storeUint(stakePeriod, 32);

        return await this.sendTransfer({
            provider,
            via,
            value: Gas.send_commissions + Gas.jetton_transfer,
            toAddress: stakingAddress,
            fwdAmount: Gas.send_commissions,
            jettonAmount: stakeAmount,
            fwdPayload: forwardPayload.endCell(),
            queryId: queryId ?? 0,
        });
    }
}
