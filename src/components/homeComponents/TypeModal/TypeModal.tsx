import React from 'react';
import { View } from 'react-native';
import { TransactionType } from 'src/core/enum/TransactionType';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import TypeButton from './TypeButton';

type TypeModalType = {
    closeModal: () => void;
    typeSelect: TransactionType;
    setTyeSelect: (type: TransactionType) => void;
};

const TypeModal: React.FC<TypeModalType> = ({
    closeModal,
    typeSelect,
    setTyeSelect,
}) => {
    return (
        <View style={[appStyles.mh25, appStyles.mt15]}>
            <TypeButton
                titleWithI18n={LanguageKey.common_text_all}
                typeSelect={typeSelect}
                type={TransactionType.All}
                onPress={() => {
                    setTyeSelect(TransactionType.All);
                    closeModal();
                }}
            />
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
            {/* <TypeButton
                titleWithI18n={LanguageKey.home_swap_title}
                typeSelect={typeSelect}
                type={TransactionType.Swap}
                onPress={() => {
                    setTyeSelect(TransactionType.Swap);
                    closeModal();
                }}
            /> */}
        </View>
    );
};

export default TypeModal;
