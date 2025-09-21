import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, TextInput } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import wordlistsBIP39 from 'src/assets/wordlistsBIP39.json';
import AppToastType from 'src/core/enum/AppToastType';
import ThemeKey from 'src/core/enum/ThemeKey';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import NativeWalletCoreModule from 'src/core/modules/WalletCoreModules/NativeWalletCoreModule';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    addAccount,
    getAllAccount,
    getPin,
    setTemporaryMnemonic,
} from 'src/core/redux/slice/account.slice';
import { getThemeMode } from 'src/core/redux/slice/app.slice';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import { NavigationStackKey } from 'src/navigation/enum/NavigationKey';
import { HomeParamListType } from 'src/navigation/stacks/type/HomeParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const useRestoreWallet = ({ navigation }: RootNavigationType) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const theme: AppThemeType = useAppTheme();
    const pin = useAppSelector(getPin);
    const themeMode = useAppSelector(getThemeMode);
    const walletData = useAppSelector(getAllAccount);
    const [modalVisible, setModalVisible] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const nativeWalletCoreModule = new NativeWalletCoreModule();
    const [secretPhraseInputs, setSecretPhraseInputs] = useState(
        Array(12).fill(''),
    );
    const [widthView, setWidthView] = useState(Utils.screenWidth);
    const [indexInputFocus, setIndexInputFocus] = useState<number | null>(null);
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const insets: EdgeInsets = useAppSafeAreaInsets();
    const onCloseModal = () => {
        setModalVisible(false);
    };
    const onDismissKeyboard = () => setShowSuggestions(false);

    const [disableButton, setDisableButton] = useState(true);
    const isDarkTheme = themeMode === ThemeKey.dark;

    const onFocusInput = (index: number) => {
        setIndexInputFocus(index);
        setSuggestions([]);
        if (!showSuggestions) {
            setShowSuggestions(true);
        }
    };
    const handleLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setWidthView(width);
    };
    useEffect(() => {
        if (secretPhraseInputs) {
            setDisableButton(!secretPhraseInputs.every(e => e !== ''));
        }
    }, [secretPhraseInputs]);

    const handleInputChange = (text: string, index: number) => {
        const currentText = text.toLocaleLowerCase();
        const textArray = currentText
            .split(' ')
            .filter(e => e !== '')
            .slice(0, 12 - index);

        const updatedInputs = [...secretPhraseInputs];
        if (textArray.length > 0) {
            textArray.forEach((e, i) => {
                updatedInputs[i + index] = e.trim();
            });
        } else {
            updatedInputs[index] = currentText;
        }
        setSecretPhraseInputs(updatedInputs);

        if (currentText.length > 0) {
            const filteredWords = wordlistsBIP39.filter(word =>
                word.startsWith(currentText),
            );
            if (
                filteredWords.length === 1 &&
                currentText === filteredWords[0]
            ) {
                setSuggestions([]);
            } else {
                setSuggestions(filteredWords);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleWordSelect = (word: string) => {
        const updatedInputs = [...secretPhraseInputs];
        updatedInputs[indexInputFocus ?? 0] = word;
        setSecretPhraseInputs(updatedInputs);
        setSuggestions([]);
        inputRefs.current[(indexInputFocus ?? 0) + 1]?.focus();
    };

    // MARK: Case restore wallet
    const handleRestoreAccount = async () => {
        setDisableButton(true);
        setSuggestions([]);
        setIsLoading(true);
        const secretPhrase = secretPhraseInputs.join(' ');
        const findWalletResult = walletData?.find(
            e => e.mnemonic === secretPhrase,
        );
        if (findWalletResult) {
            Utils.showToast({
                msg: t(LanguageKey.restore_error_added),
                type: AppToastType.error,
            });
            setDisableButton(false);
            setIsLoading(false);
        } else {
            try {
                const mnemonic = await nativeWalletCoreModule.importWallet({
                    secretPhrase,
                });

                if (mnemonic) {
                    dispatch(setTemporaryMnemonic(mnemonic));
                    if (pin !== undefined && pin !== null) {
                        const res = await dispatch(
                            addAccount({ mnemonic: mnemonic, pinCode: pin }),
                        );
                        if (addAccount.fulfilled.match(res)) {
                            if (Keyboard.isVisible()) {
                                Keyboard.dismiss();
                            }
                            const param: HomeParamListType = {
                                reShowWalletModal: true,
                            };
                            navigation.navigate(
                                NavigationStackKey.HomeStack,
                                param,
                            );
                            setTimeout(() => {
                                Utils.showToast({
                                    msg: t(LanguageKey.restore_success_title),
                                    type: AppToastType.success,
                                });
                            }, 500);
                        }
                    } else {
                        if (Keyboard.isVisible()) {
                            Keyboard.dismiss();
                        }
                        setTimeout(() => {
                            navigation.navigate(
                                NavigationStackKey.PinCodeStack,
                            );
                        }, 100);
                        setDisableButton(false);
                    }
                }
            } catch (error) {
                console.error('handleRestoreAccount Error:', error);
                setModalVisible(true);
                setDisableButton(false);
            } finally {
                setIsLoading(false);
            }
        }
    };
    const isMiddleItem = (index: number): boolean => {
        return index % 3 === 1;
    };

    return {
        modalVisible,
        onCloseModal,
        handleInputChange,
        handleWordSelect,
        suggestions,
        theme,
        handleRestoreAccount,
        onDismissKeyboard,
        showSuggestions,
        secretPhraseInputs,
        isMiddleItem,
        onFocusInput,
        disableButton,
        isDarkTheme,
        insets,
        inputRefs,
        indexInputFocus,
        isLoading,
        widthView,
        newUI,
        setWidthView,
        handleLayout,
    };
};
export default useRestoreWallet;
