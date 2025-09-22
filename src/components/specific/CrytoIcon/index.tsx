import React from 'react';
import {CoinType} from 'src/core/enum/CoinType';
import {BitcoinSvgIcon, EthereumSvgIcon} from 'src/core/constants/AppIconsSvg';
import {ProtocolType} from 'src/core/enum/ProtocolType';

type CrytoIconType = {
    crytoIcon: CoinType | ProtocolType;
    width?: number;
    height?: number;
};

const CrytoIcon: React.FC<CrytoIconType> = ({
    crytoIcon,
    width = 16,
    height = 16,
}) => {
    const getIconFromCoinType = () => {
        switch (crytoIcon) {
            case CoinType.Bitcoin:
            case ProtocolType.Bitcoin:
                return <BitcoinSvgIcon width={width} height={height} />;
            case CoinType.Ethereum:
                return <EthereumSvgIcon width={width} height={height} />;

            default:
                return <BitcoinSvgIcon width={width} height={height} />;
        }
    };

    return getIconFromCoinType();
};

export default CrytoIcon;
