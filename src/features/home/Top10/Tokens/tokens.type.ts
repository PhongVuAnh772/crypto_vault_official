import { LoadingImage } from 'src/components/common/AppImage/type';

export type HeaderListTopEVMsProps = {
    newUI: boolean;
    usingWithLoading?: boolean;
};

export type TopTokenItem = {
    contract_address: string;
    market_cap_usd: string;
    price_24h_percent_change: string;
    price_7d_percent_change: string;
    price_usd: string;
    token_decimals: string;
    token_logo: string;
    token_name: string;
    token_symbol: string;
};

export type RenderTopItemProps = {
    item: TopTokenItem;
    setLoadingImages: (uri: string, value: boolean) => void;
    loadingImages: LoadingImage;
    newUI: boolean;
    index: string;
    handleFiatConverted: (price: number) => string;
};

export type TopTokenLoadingProps = {
    newUI: boolean;
};
