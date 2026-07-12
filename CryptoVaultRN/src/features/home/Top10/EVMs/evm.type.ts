import { LoadingImage } from 'src/components/common/AppImage/type';

export type TopEVMsItem = {
    ath_date: string;
    ath_percent_change: string;
    circulating_supply: string;
    logo: string;
    market_cap_24hr_change: string;
    market_cap_24hr_percent_change: string;
    market_cap_rank: string;
    market_cap_usd: string;
    name: string;
    symbol: string;
    total_supply: string;
    total_volume: string;
    usd_price: string;
    usd_price_1hr_percent_change: string;
    usd_price_24hr_change: string;
    usd_price_24hr_high: string;
    usd_price_24hr_low: string;
    usd_price_24hr_percent_change: string;
    usd_price_30d_percent_change: string;
    usd_price_7d_percent_change: string;
    usd_price_ath: string;
};

export type RenderTopItemProps = {
    item: TopEVMsItem;
    setLoadingImages: (uri: string, value: boolean) => void;
    loadingImages: LoadingImage;
    index: string;
    handleFiatConverted: (price: number) => string;
};
