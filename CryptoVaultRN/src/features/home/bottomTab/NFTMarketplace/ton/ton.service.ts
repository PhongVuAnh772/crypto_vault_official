import { NFTCollection } from '../NFTMarketplace.type';

export const fetchTonCollections = async (
    category: string,
    query?: string,
): Promise<NFTCollection[]> => {
    let kind = 'all';
    if (category === 'Recent') kind = 'day';
    else if (category === 'Trending') kind = 'week';
    else if (category === 'Popular') kind = 'month';

    const url = `https://api.getgems.io/public-api/v1/collections/top?kind=${kind}&limit=20`;
    const response = await fetch(url, {
        headers: {
            accept: 'application/json',
            Authorization:
                '1775195839421-mainnet-10926032-r-FKgyDVTiROpQT2dzM5SSXqxXNmMkxqUsFCFtU6xBMCSgVSkr',
        },
    });

    const data = await response.json();
    if (!(data.success && data.response?.items)) {
        return [];
    }

    let items = data.response.items;
    if (query && query.trim().length > 0) {
        const lowerQuery = query.toLowerCase();
        items = items.filter(
            (item: any) =>
                item.collection.name?.toLowerCase().includes(lowerQuery) ||
                item.collection.description?.toLowerCase().includes(lowerQuery),
        );
    }

    return items.map((item: any) => ({
        id: item.collection.address,
        name: item.collection.name || 'Unknown Collection',
        image: item.collection.image || 'https://via.placeholder.com/300',
        floorPrice: item.floorPrice?.toString() || '0.00',
        itemCount: Number(item.collection.itemsCount || 0),
        network: 'TON',
        isVerified: true,
    }));
};
