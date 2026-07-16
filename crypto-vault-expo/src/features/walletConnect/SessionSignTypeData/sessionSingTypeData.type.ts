type EIP712Domain = {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
};

type OfferItem = {
    itemType: number;
    token: string;
    identifierOrCriteria: string; 
    startAmount: string;
    endAmount: string;
};

type ConsiderationItem = {
    itemType: number;
    token: string;
    identifierOrCriteria: string;
    startAmount: string;
    endAmount: string;
    recipient: string;
};

type OrderComponents = {
    offerer: string;
    zone: string;
    offer: OfferItem[];
    consideration: ConsiderationItem[];
    orderType: number;
    startTime: string;
    endTime: string;
    zoneHash: string;
    salt: string;
    conduitKey: string;
    counter: string;
};

export type SignTypedData = {
    types: {
        EIP712Domain?: { name: keyof EIP712Domain; type: string }[];
        OrderComponents?: { name: keyof OrderComponents; type: string }[];
        OfferItem?: { name: keyof OfferItem; type: string }[];
        ConsiderationItem: { name: keyof ConsiderationItem; type: string }[];
    };
    primaryType: string;
    domain: EIP712Domain;
    message: OrderComponents & {
        totalOriginalConsiderationItems: string;
    };
};
