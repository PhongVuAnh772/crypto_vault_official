export interface NFTCollection {
    id: string;
    name: string;
    image: string;
    floorPrice: string;
    itemCount: number;
    network: string;
    networkIcon?: string;
    isVerified?: boolean;
}
