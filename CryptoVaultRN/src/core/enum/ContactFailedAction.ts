export enum ErrorContextKey {
    Feature = 'Feature',
    Protocol = 'Protocol',
    FileError = 'FileError',
    FunctionError = 'FunctionError',
    LineError = 'LineError',
    Reason = 'Reason',
    id = 'id',
}

export enum CommonContextMessage {
    errorMissingData = 'Missing Data',
    callApiFailed = 'callApiFailed',
}

export enum Feature {
    Home = 'Home',
    ScanQrCode = 'ScanQrCode',
    Transfer = 'Transfer',
    JettonTransfer = 'JettonTransfer',
    ScanToken = 'ScanToken',
    ScanAddress = 'ScanAddress',
    ScanSlip0044 = 'ScanSlip0044',
    AboutUs = 'AboutUs',
    Contact = 'Contact',
    ManageCrypto = 'ManageCrypto',
    TransactionDetails = 'TransactionDetails',
    ScanTonAddress = 'ScanTonAddress',
    NFTCollection = 'NFTCollection',
    SelectToken = 'SelectToken',
    Setting = 'Setting',
    ClaimToken = 'ClaimToken',
}
