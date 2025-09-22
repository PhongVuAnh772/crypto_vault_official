import React from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import TypeTransactionModal from 'src/components/homeComponents/TypeTransactionModal/TypeTransactionModal';
import BottomSheetModal from 'src/components/specific/BottomSheetModal/BottomSheetModal.view';
import Slip0044 from 'src/core/enum/Slip0044';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import BitcoinTransactionTab from './bitcoin/bitcoin.transactionTab.view';
import { TransactionModalHeader } from './components';
import EvmTransactionTab from './evm/evm.transactionTab.view';
import TonTransactionTab from './ton/ton.transactionTab.view';
import useTransaction from './transactionTab.hook';

const TransactionTab: React.FC<RootNavigationType> = ({navigation}) => {
    const theme = useAppTheme();
    const {
        showTypeModal,
        setShowTypeModal,
        typeSelect,
        handleClosingTypeModal,
        changeTypeSelect,
        slip0044,
    } = useTransaction();

    const getHistoryView = () => {
        switch (slip0044) {
            case Slip0044.Ton:
                return (
                    <TonTransactionTab
                        navigation={navigation}
                        setShowTypeModal={setShowTypeModal}
                        typeSelect={typeSelect}
                    />
                );
            case Slip0044.Bitcoin:
                return (
                    <BitcoinTransactionTab
                        navigation={navigation}
                        setShowTypeModal={setShowTypeModal}
                        typeSelect={typeSelect}
                    />
                );
            default:
                return (
                    <EvmTransactionTab
                        navigation={navigation}
                        setShowTypeModal={setShowTypeModal}
                        typeSelect={typeSelect}
                    />
                );
        }
    };

    return (
        <ScreenWrapper
            paddingTop
            backgroundColor={theme.colors.surface_surface_default}>
            <BottomSheetModal
                showModal={showTypeModal}
                closeModalAction={handleClosingTypeModal}
                maxHeight={0.4}
                child={
                    <TouchableWithoutFeedback style={appStyles.flex1}>
                        <View style={appStyles.mt5}>
                            <TransactionModalHeader
                                title={LanguageKey.select_type_title}
                                closeModal={handleClosingTypeModal}
                            />
                            <TypeTransactionModal
                                closeModal={() => setShowTypeModal(false)}
                                typeSelect={typeSelect}
                                setTyeSelect={changeTypeSelect}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                }
            />
            <View style={[appStyles.mh10, appStyles.mt55]}>
                {getHistoryView()}
            </View>
        </ScreenWrapper>
    );
};

export default TransactionTab;
