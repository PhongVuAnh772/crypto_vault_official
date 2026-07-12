import MoralisService from 'src/core/services/Moralis';
import { ChainMoralis } from 'src/core/services/Moralis/type';
import { NFTCollection } from '../NFTMarketplace.type';

const moralisService = new MoralisService();

const getMoralisChainBySymbol = (symbol?: string): ChainMoralis => {
    const normalized = (symbol || '').toLowerCase();
    if (normalized.includes('bnb') || normalized.includes('bsc')) return ChainMoralis.bsc;
    if (normalized.includes('eth')) return ChainMoralis.eth;
    return ChainMoralis.polygon;
};

export const fetchEvmCollections = async ({
    walletAddress,
    protocolSymbol,
    query,
}: {
    walletAddress?: string;
    protocolSymbol?: string;
    query?: string;
}): Promise<NFTCollection[]> => {
    if (!walletAddress) {
        return [];
    }

    const chain = getMoralisChainBySymbol(protocolSymbol);
    const res = await moralisService.getNFTCollectionsByWallet(walletAddress, {
        chain,
        limit: 50,
    });
    const rawCollections = res?.data?.result || [];

    let items = rawCollections;
    if (query && query.trim().length > 0) {
        const lowerQuery = query.toLowerCase();
        items = items.filter(
            (item: any) =>
                item.name?.toLowerCase().includes(lowerQuery) ||
                item.symbol?.toLowerCase().includes(lowerQuery) ||
                item.contract_type?.toLowerCase().includes(lowerQuery),
        );
    }

    return items.map((item: any, index: number) => ({
        id: item.token_address || `${item.name || 'collection'}-${index}`,
        name: item.name || item.symbol || 'Unknown Collection',
        image:
            item.collection_logo ||
            item.collection_banner_image ||
            item.normalized_metadata?.image ||
            'https://via.placeholder.com/300',
        floorPrice: (item.floor_price_usd || item.floor_price || item.floor_price_native || '0.00').toString(),
        itemCount: Number(item.token_count || 0),
        network:
            chain === ChainMoralis.eth
                ? 'ETH'
                : chain === ChainMoralis.bsc
                  ? 'BNB'
                  : 'MATIC',
        isVerified: item.verified_collection ?? false,
    }));
};
