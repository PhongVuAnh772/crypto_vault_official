import { useState } from 'react';
import { TransactionType } from 'src/core/enum/TransactionType';
import { useProtocolSelected } from 'src/core/redux/slice/account.selector';

const useTransaction = () => {
    const protocolBaseData = useProtocolSelected();
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [typeSelect, setTypeSelect] = useState<TransactionType>(
        TransactionType.All,
    );

    const handleClosingTypeModal = () => {
        setShowTypeModal(false);
    };

    const changeTypeSelect = async (type: TransactionType) => {
        setTypeSelect(type);
    };

    const slip0044 = protocolBaseData?.slip0044;

    return {
        showTypeModal,
        setShowTypeModal,
        typeSelect,
        handleClosingTypeModal,
        changeTypeSelect,
        slip0044,
    };
};

export default useTransaction;
