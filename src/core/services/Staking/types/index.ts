// Define the wallet information
export type WalletInfo = {
    // Private key for the wallet
    privateKey: string;
    // Public key for the wallet
    publicKey: string;
};

// Define the parameters for staking
export type StakeParams = {
    // Address of the jetton wallet
    jettonWalletAddress: string;
    // Address of the staking pool
    stakingPoolAddress: string;
    // Amount of tokens to stake
    stakeAmount: bigint;
    // Duration for which the tokens are staked (Millisecond)
    stakePeriod: number;
} & WalletInfo;

// Define the parameters for unstaking
export type UnStakeParams = {
    // Address of the NFT
    nftAddress: string;
} & WalletInfo;

export interface IStaking {
    /**
     * Stake tokens in the staking pool.
     *
     * @param jettonWalletAddress - The address of the jetton wallet.
     * @param privateKey - The private key of the wallet.
     * @param publicKey - The public key of the wallet.
     * @param stakeAmount - The amount of tokens to stake.
     * @param stakePeriod - The duration for which the tokens are staked.
     * @param stakingPoolAddress - The address of the staking pool.
     *
     * @returns {Promise<boolean>} A Promise that resolves to a boolean indicating the success or failure of the unstaking process.
     */
    stake(params: StakeParams): Promise<boolean>;

    /**
     * Initiates the unstaking process for a given NFT address using the provided private and public keys.
     *
     * @param {UnStakeParams} params - The parameters required for unstaking.
     * @param nftAddress - The address of the NFT to be unstaked.
     * @param privateKey - The private key of the wallet.
     * @param publicKey - The public key of the wallet.
     *
     * @returns {Promise<boolean>} A Promise that resolves to a boolean indicating the success or failure of the unstaking process.
     */
    unStake(params: UnStakeParams): Promise<boolean>;
}
