import { StackActions, StackActionType } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EdgeInsets } from 'react-native-safe-area-context';
import AuthAction from 'src/core/enum/AuthAction';
import LanguageType from 'src/core/enum/LanguageType';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import NativeWalletCoreModule from 'src/core/modules/WalletCoreModules/NativeWalletCoreModule';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { setTemporaryMnemonic } from 'src/core/redux/slice/account.slice';
import {
    changeLanguageType,
    getKeepSplash,
    getLanguageType,
    setAuthAction,
    setIsFirstTime,
    setKeepSplash,
} from 'src/core/redux/slice/app.slice';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';
import { TypeLanguage } from 'src/features/setting/changelanguage/changeLanguage.type';
import { NavigationStackKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const useOnboardingScreen = ({ navigation }: RootNavigationType) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const dispatch = useAppDispatch();
    const [isVisible, setIsVisible] = useState(false);
    const insets: EdgeInsets = useAppSafeAreaInsets();
    const theme: AppThemeType = useAppTheme();
    const keepSplash = useAppSelector(getKeepSplash);
    const [count, setCount] = useState(1);
    const isFirstScreen = count === 1;
    const maxCount = 3;
    const [showDropdown, setShowDropdown] = useState(false);

    const [
        actionNavigationAfterModalDismiss,
        setActionNavigationAfterModalDismiss,
    ] = useState<StackActionType>();
    const nativeWalletCoreModule = new NativeWalletCoreModule();
    const onModalConfirmDismiss = () => {
        if (actionNavigationAfterModalDismiss) {
            navigation.dispatch(actionNavigationAfterModalDismiss);
            // Clear action
            setActionNavigationAfterModalDismiss(undefined);
        }
    };
    const listLanguage: TypeLanguage[] = [
        { language: 'English', key: LanguageType.en },
        {
            language: '日本語',
            key: LanguageType.jp,
        },
    ];
    const { i18n } = useTranslation();
    const languageType = useAppSelector(getLanguageType) ?? '';
    const onChangeLanguage = (key: LanguageType) => {
        dispatch(changeLanguageType(key));
        i18n.changeLanguage(key);
        closeDropdown();
    };
    const openDropdown = () => {
        setShowDropdown(!showDropdown);
    };
    const closeDropdown = () => {
        setShowDropdown(false);
    };

    useEffect(() => {
        if (keepSplash) {
            dispatch(setKeepSplash(false));
        }
    }, [dispatch, keepSplash]);
    const createRestoreWalletAction = () => {
        dispatch(setAuthAction(AuthAction.restoreWallet));
        navigation.dispatch(
            StackActions.push(NavigationStackKey.RestoreWalletStack),
        );
    };

    const nextAction = () => {
        const isCompletedOnboarding = count === 2;
        const newCount = count + 1;
        if (newCount <= maxCount) {
            setCount(newCount);
        }
        if (isCompletedOnboarding) {
            dispatch(setIsFirstTime(false));
        }
    };

    const getTitle = () => {
        switch (count) {
            case 1:
                return LanguageKey.onboarding_welcome_title;
            case 2:
                return LanguageKey.onboarding_title_2;
            case 3:
                return LanguageKey.onboarding_title_3;
            default:
                break;
        }
    };

    const getSubTitle = () => {
        switch (count) {
            case 1:
                return LanguageKey.create_new_wallet_warning;
            case 2:
                return LanguageKey.onboarding_sub_title_2;
            case 3:
                return LanguageKey.onboarding_sub_title_3;
            default:
                break;
        }
    };

    const openModalCreateNewWallet = () => {
        setIsVisible(!isVisible);
    };
    const closeModalCreateNewWallet = () => {
        setIsVisible(false);
    };

    const createWalletAction = async () => {
        dispatch(setAuthAction(AuthAction.newWallet));
        try {
            const mnemonic = await nativeWalletCoreModule.createWallet();
            if (mnemonic) {
                dispatch(setTemporaryMnemonic(mnemonic));
                setActionNavigationAfterModalDismiss(
                    StackActions.push(NavigationStackKey.AuthStack, {
                        screen: NavigationStackKey.CreateWalletStack,
                    }),
                );
                closeModalCreateNewWallet();
            }
        } catch (error) {
            console.log('error', error);
        }
    };

    return {
        createRestoreWalletAction,
        onChangeLanguage,
        nextAction,
        getTitle,
        getSubTitle,
        openDropdown,
        closeDropdown,
        count,
        showDropdown,
        insets,
        theme,
        listLanguage,
        languageType,
        isVisible,
        openModalCreateNewWallet,
        closeModalCreateNewWallet,
        createWalletAction,
        onModalConfirmDismiss,
        isFirstScreen,
        newUI,
    };
};

export default useOnboardingScreen;
