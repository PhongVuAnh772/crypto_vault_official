export interface UserData {
    email: string;
    email_verified: boolean;
    family_name: string;
    given_name: string;
    name: string;
    nickname: string;
    picture: string;
    sub: string;
    updated_at: string;
    role: string;
    auth0Id: string;
}
export type RezPointStateType = {
    userInfo?: UserData;
    currentAuthorizationCode?: string;
    stateCode?: string;
    stateCodeFromCallBack?: string;
    balanceInfo?: BalanceData;
    accountDeactivate: boolean;
    accountDeleted: boolean;
    accountDeletedOnlyCreateAccountUtil30Days: boolean;
    sessionId?: string;
    pointExpiringInfo?: RezPointPointExpire;
    isLoading: boolean;
};
export type RezPointPointExpire = {
    listPointExpiring: PointExpirationInfo[];
    pointExpiringLatest: PointExpiringLatest;
};
export type PointExpiringLatest = {
    expiredDate: Date;
    totalPointExpired: number;
};
export type PointExpirationInfo = {
    dayExpired: number;
    expiredAt: string;
    expiredDate: string;
    pointExpired: number;
};
export type APIGetUserResponse = {
    isSuccess: boolean;
    data: APIGetUserResponseData;
    status: number;
};

export type APIGetUserResponseData = {
    user: UserData;
    accessToken: string;
    sessionId: string;
};
export type GetUserPrams = {
    accessToken: string;
    idToken: string;
    deviceToken: string;
    deviceType: string;
};

export type SetCurrentAuthorizationAndStateCodeType = {
    authorizationCode: string;
    stateCode: string;
};
export type BalanceData = {
    userId: string;
    balance: number;
    userAuth0Id: string;
};
export type GetBalanceResponse = {
    data: BalanceData;
    statusCode: number;
};
export type GetPointExpireResponse = {
    data: {
        listPointExpiring: PointExpirationInfo[];
        pointExpiring: PointExpiringLatest;
    };
    statusCode: number;
};
export enum StatusAccount {
    ACCESS_DENIED = 'access_denied',
}
export enum ErrorCode {
    ACCOUNT_DEACTIVATED = '1000157',
    ACCOUNT_DELETED = '1000158',
    ACCOUNT_DELETED_ONLY_CREATE_ACCOUNT_UTIL_30_DAYS = '1000162',
}
export type TransactionHistory = {
    _id: string;
    amount: number;
    createdAt: string;
    description: string;
    status: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REVOKED';
    type: 'purchase' | 'transfer' | 'top-up' | 'minting';
    updatedAt: string;
    transactionId: string;
};

export type StatusTransaction = Pick<TransactionHistory, 'status'>;
export type TypeTransaction = Pick<TransactionHistory, 'type'>;
export type TransactionRecord = {
    title: string;
    data: TransactionHistory[];
};

export type GetTransactionHistoryResponse = {
    headers: Headers;
    items: TransactionRecord[];
};
export type GetTransactionHistoryParams = {
    perPage: number;
    page: number;
};
