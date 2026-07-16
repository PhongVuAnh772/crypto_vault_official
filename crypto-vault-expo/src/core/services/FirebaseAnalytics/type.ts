export type PushEventThirdPartyServiceType = {
    thirdPartyName: ThirdPartyService;
    error: string;
};

export enum ThirdPartyService {
    Web3 = 'web3',
    Moralis = 'moralis',
    Ton = 'ton',
    BlockCypher = 'blockcypher',
}
