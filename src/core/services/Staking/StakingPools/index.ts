import {Address, Cell, Contract, ContractProvider} from '@ton/core';

class StakingPools implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: {code: Cell; data: Cell},
    ) {}

    static createFromAddress(address: Address) {
        return new StakingPools(address);
    }

    async getStorageData(provider: ContractProvider) {
        const result = await provider.get('get_storage_data', []);

        return {
            init: result.stack.readNumber(),
            next_item_index: result.stack.readNumber(),
            nft_item_code: result.stack.readCell(),
            collection_content: result.stack.readCell(),
            lock_wallet_address: result.stack.readAddress(),
            rewards_wallet_address: result.stack.readAddress(),
            staking_params: result.stack.readCell(),
            minimum_deposit: result.stack.readBigNumber(),
            rewards_balance: result.stack.readBigNumber(),
            last_tvl: result.stack.readBigNumber(),
            lock_wallet_set: result.stack.readNumber(),
            rewards_wallet_set: result.stack.readNumber(),
            is_unlimited_rewards: result.stack.readNumber(),
            admin_address: result.stack.readAddress(),
            creator_address: result.stack.readAddress(),
        };
    }
}

export default StakingPools;
