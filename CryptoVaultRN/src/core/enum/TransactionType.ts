export enum TransactionType {
    Sent = 'Sent',
    Receive = 'Receive',
    Swap = 'Swap',
    All = 'All',
    Coin = 'Coin',
    SendNFT = 'Send NFT',
    ReceiveNFT = 'Receive NFT',
    SmartContractExec = 'Called Contract',
}
export enum TransactionStatusType {
    Completed = 'Completed',
    Pending = 'Pending',
    Failed = 'Failed',
}

export enum TransactionNFTEmulateStatusType {
    Completed = 'ok',
    Failed = 'failed',
}

export enum TransactionDetailType {
    SmartContractExec = 'SmartContractExec',
    ContractDeploy = 'ContractDeploy',
}
