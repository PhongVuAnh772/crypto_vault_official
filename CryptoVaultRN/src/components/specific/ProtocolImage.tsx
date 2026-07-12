import React from 'react';
import {
    BinanceSvgIcon,
    BitcoinSvgIcon,
    BscSvgIcon,
    EthereumSvgIcon,
    PolygonSvgIcon,
    TonSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import Slip0044 from 'src/core/enum/Slip0044';
import AppImage from '../common/AppImage';
import protocolItemStyle from '../homeComponents/ProtocolItem/style';

const ProtocolImage = ({
    slip0044,
    isDefaultData,
    size = 24,
    logoUri,
    bonusId,
    setLoadingImages,
    isLoadingImage,
}: {
    isDefaultData?: boolean;
    slip0044?: Slip0044;
    size?: number;
    logoUri?: string | null;
    bonusId?: string;
    setLoadingImages?: (uri: string, value: boolean) => void;
    isLoadingImage?: boolean;
}) => {
    const getProtocolLocalImage = (slip0044?: Slip0044, size?: number) => {
        switch (slip0044) {
            case Slip0044.Bitcoin:
                return <BitcoinSvgIcon width={size} height={size} />;
            case Slip0044.Ton:
                return <TonSvgIcon width={size} height={size} />;
            case Slip0044.Ethereum:
                return <EthereumSvgIcon width={size} height={size} />;
            case Slip0044.Binance:
                return <BinanceSvgIcon width={size} height={size} />;
            case Slip0044.SmartChain:
                return <BscSvgIcon width={size} height={size} />;
            case Slip0044.Polygon:
                return <PolygonSvgIcon width={size} height={size} />;
            default:
                return <BitcoinSvgIcon width={size} height={size} />;
        }
    };

    const hasLogoUri = !!(logoUri && logoUri.trim().length > 0 && logoUri.startsWith('http'));

    return isDefaultData || !hasLogoUri ? (
        getProtocolLocalImage(slip0044, size)
    ) : (
        <AppImage
            uri={logoUri ?? ''}
            styleImage={protocolItemStyle.imageToken}
            isLoading={isLoadingImage}
            setIsLoading={setLoadingImages}
            skeletonRadius={100}
            bonusId={bonusId}
        />
    );
};

export default ProtocolImage;
