import { StackActions } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EdgeInsets } from 'react-native-safe-area-context';
import AppToastType from 'src/core/enum/AppToastType';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    addAccount,
    getPin,
    getTemporaryMnemonic,
} from 'src/core/redux/slice/account.slice';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import { NavigationStackKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

type ResultType = {
    index: number;
    selected?: string;
    result?: boolean;
}[];

export type ItemType = {
    index: number;
    question: string;
    correctAnswer: string;
    options: string[];
};

const useConfirmSecretPhrase = ({ navigation }: RootNavigationType) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const insets: EdgeInsets = useAppSafeAreaInsets();
    const mnemonic = useAppSelector(getTemporaryMnemonic) ?? '';
    const pinCode = useAppSelector(getPin);
    const mnemonicData = mnemonic?.split(' ');
    const [results, setResults] = useState<ResultType>();
    const [questionData, setQuestionData] = useState<ItemType[]>();
    const [isLoading, setIsLoading] = useState(false);
    const theme = useAppTheme();

    useEffect(() => {
        setQuestionData(Utils.generateQuestions(mnemonicData ?? []));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const actionConfirm = async () => {
        setIsLoading(true);
        const pass = results?.every(e => e.result);
        if (pass) {
            if (pinCode !== undefined && pinCode !== null) {
                const res = await dispatch(
                    addAccount({ mnemonic: mnemonic, pinCode: pinCode }),
                );
                if (addAccount.fulfilled.match(res)) {
                    navigation.navigate(NavigationStackKey.HomeStack);
                    Utils.showToast({
                        msg: t(LanguageKey.create_wallet_success_title),
                        type: AppToastType.success,
                    });
                }
            } else {
                navigation.dispatch(
                    StackActions.push(NavigationStackKey.PinCodeStack),
                );
            }
        } else {
            setModalVisible(true);
        }
        setIsLoading(false);
    };

    const handleSelectOption = (item: ItemType, option: string) => {
        const findResult = results?.find(result => result.index === item.index);

        if (findResult) {
            const newResults = results?.filter(
                result => result.index !== item.index,
            );
            newResults?.push({
                index: item.index,
                selected: option,
                result: option === item.correctAnswer,
            });
            setResults(newResults);
        } else {
            const newData = {
                index: item.index,
                selected: option,
                result: option === item.correctAnswer,
            };
            setResults(
                results !== undefined ? [...results, newData] : [newData],
            );
        }
    };
    const [modalVisible, setModalVisible] = useState(false);

    const getResult = (index: number) =>
        results?.find(result => result.index === index);

    return {
        getResult,
        handleSelectOption,
        modalVisible,
        setModalVisible,
        questionData,
        actionConfirm,
        results,
        theme,
        isLoading,
        insets,
        newUI,
    };
};
export default useConfirmSecretPhrase;
