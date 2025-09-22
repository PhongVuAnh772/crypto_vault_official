import {Address, TonClient, WalletContractV5R1} from '@ton/ton';
import appErrorMessage from 'src/core/constants/AppErrorMessage';
import TonUtils from 'src/core/utils/tonUtils';
import {JettonWallet} from './jettonWallet';
import {IStaking, StakeParams, UnStakeParams, WalletInfo} from './types';

class Staking implements IStaking {
    private readonly client: TonClient;

    constructor() {
        this.client = new TonClient({
            endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
            apiKey: '3cf7ce101c9239d4d2512a87c4376fe7ad49110f7ffdfca00f071e3a024253f2',
        });
    }

    async stake({
        jettonWalletAddress,
        privateKey,
        publicKey,
        stakeAmount,
        stakePeriod,
        stakingPoolAddress,
    }: StakeParams): Promise<boolean> {
        try {
            // Validate the staking parameters to ensure all required fields are present and valid
            this.validateStakeParams({
                privateKey,
                publicKey,
                stakeAmount,
                stakePeriod,
                jettonWalletAddress,
                stakingPoolAddress,
            });

            // Generate the jetton wallet using the provided public and private keys
            const jettonWallet = await this.generateJettonWallet({
                publicKey,
                privateKey,
            });

            // Parse the staking pool address from the provided string
            const stakingAddress = Address.parse(stakingPoolAddress);

            // Open a connection to the jetton wallet using its address
            const initStake = this.client.open(
                JettonWallet.createFromAddress(
                    Address.parse(jettonWalletAddress),
                ),
            );

            // Open a connection to the wallet provider using the generated jetton wallet
            const walletProvider = this.client.open(jettonWallet.wallet);

            // Send the stake transaction to the staking pool with the specified parameters
            await initStake.sendStake(
                walletProvider.sender(jettonWallet.secretKey),
                stakingAddress,
                stakeAmount,
                stakePeriod,
                0,
            );

            // Return true to indicate the staking was successful
            return true;
        } catch (error) {
            console.error('🚀 ~ Staking ~ error:', error);
            return false;
        }
    }

    async unStake({
        nftAddress,
        privateKey,
        publicKey,
    }: UnStakeParams): Promise<boolean> {
        try {
            // Validate the unstaking parameters to ensure all required fields are present and valid
            this.validateUnStakeParams({nftAddress, privateKey, publicKey});

            // Generate the jetton wallet using the provided public and private keys
            const jettonWallet = await this.generateJettonWallet({
                publicKey,
                privateKey,
            });

            // Parse the NFT address to create a JettonWallet instance
            const parseAddress = JettonWallet.createFromAddress(
                Address.parse(nftAddress), // Convert the NFT address string to an Address object
            );

            // Open a connection to the wallet provider using the generated jetton wallet
            const walletProvider = this.client.open(jettonWallet.wallet);

            // Open a connection to the unstaking wallet using the parsed NFT address
            const initUnStake = this.client.open(parseAddress);

            // Send the unstake transaction to the wallet provider with the specified parameters
            await initUnStake.sendUnStake(
                walletProvider.sender(jettonWallet.secretKey), // Use the wallet provider to send the unstake request
                0, // The amount to unstake (0 indicates unstaking the entire amount)
            );

            // Return true to indicate the unstaking was successful
            return true;
        } catch (error) {
            // Log any errors that occur during the unstaking process
            console.error('🚀 ~ Staking ~ unStake ~ error:', error);
            return false; // Return false to indicate the unstaking failed
        }
    }
    private async generateJettonWallet({publicKey, privateKey}: WalletInfo) {
        const getSecretKey = TonUtils.merKeyToGetSecretKey(
            privateKey,
            publicKey,
        );
        const publicKeyConverted = Buffer.from(publicKey, 'base64');
        const workchain = 0;

        const wallet = WalletContractV5R1.create({
            workchain,
            publicKey: publicKeyConverted,
        });

        return {
            wallet,
            secretKey: getSecretKey,
        };
    }

    private validateUnStakeParams({
        nftAddress,
        privateKey,
        publicKey,
    }: UnStakeParams): void {
        if (!privateKey || !publicKey) {
            throw new Error(appErrorMessage.cannotGetKey);
        }
        if (!nftAddress) {
            throw new Error(appErrorMessage.nftAddressRequired);
        }
    }
    private validateStakeParams({
        jettonWalletAddress,
        stakingPoolAddress,
        stakeAmount,
        stakePeriod,
        privateKey,
        publicKey,
    }: StakeParams): void {
        if (!privateKey || !publicKey) {
            throw new Error(appErrorMessage.cannotGetKey);
        }
        if (!jettonWalletAddress || !stakingPoolAddress) {
            throw new Error(appErrorMessage.jettonWalletStakingPoolRequired);
        }
        if (stakeAmount <= 0) {
            throw new Error(appErrorMessage.stakeAmountZero);
        }
        if (stakePeriod <= 0) {
            throw new Error(appErrorMessage.stakePeriod);
        }
    }
}

export default Staking;
