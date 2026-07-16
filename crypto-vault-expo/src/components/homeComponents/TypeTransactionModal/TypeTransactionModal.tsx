import {View} from 'react-native';
import React from 'react';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import {TransactionType} from 'src/core/enum/TransactionType';
import TypeButton from './TypeTransactionButton';

type TypeModalType = {
    closeModal: () => void;
    typeSelect: TransactionType;
    setTyeSelect: (type: TransactionType) => void;
};

const TypeTransactionModal: React.FC<TypeModalType> = ({
    closeModal,
    typeSelect,
    setTyeSelect,
}) => {
    return (
        <View style={[appStyles.mh25, appStyles.mt15]}>
            <TypeButton
                titleWithI18n={LanguageKey.transaction_all_type}
                typeSelect={typeSelect}
                type={TransactionType.All}
                onPress={() => {
                    setTyeSelect(TransactionType.All);
                    closeModal();
                }}
            />
            {/* <TypeButton
                titleWithI18n={LanguageKey.transaction_coin_type}
                typeSelect={typeSelect}
                type={TransactionType.Coin}
                onPress={() => {
                    setTyeSelect(TransactionType.Coin);
                    closeModal();
                }}
            /> */}
            <TypeButton
                titleWithI18n={LanguageKey.home_send_title}
                typeSelect={typeSelect}
                type={TransactionType.Sent}
                onPress={() => {
                    setTyeSelect(TransactionType.Sent);
                    closeModal();
                }}
            />
            <TypeButton
                titleWithI18n={LanguageKey.home_receive_title}
                typeSelect={typeSelect}
                type={TransactionType.Receive}
                onPress={() => {
                    setTyeSelect(TransactionType.Receive);
                    closeModal();
                }}
            />
        </View>
    );
};

export default TypeTransactionModal;
