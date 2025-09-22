import {ProtocolType} from 'src/core/enum/ProtocolType';

type DataCryptoType = {
    type: ProtocolType;
};

const useProtocolPicking = (
    list: {protocol: string}[],
    searching: string,
    actionHideModal: () => void,
) => {
    const dataCrypto: DataCryptoType[] = [
        {
            type: ProtocolType.All,
        },
        {
            type: ProtocolType.Bitcoin,
        },
    ];

    const actionPicking = () => {
        actionHideModal();
    };

    const filteredData = dataCrypto.filter(item => {
        return item.type.toLowerCase().includes(searching.toLowerCase());
    });

    return {
        filteredData,
        actionPicking,
    };
};

export default useProtocolPicking;
