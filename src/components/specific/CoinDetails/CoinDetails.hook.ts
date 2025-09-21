import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import ThemeKey from 'src/core/enum/ThemeKey';
import { TransactionType } from 'src/core/enum/TransactionType';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppSelector } from 'src/core/redux/hooks';
import { getThemeMode } from 'src/core/redux/slice/app.slice';

export const useCoinDetails = ({
    typeSelect,
    onBack,
    onLoadMore,
}: {
    typeSelect: TransactionType;
    onBack?: () => void;
    onLoadMore?: () => void;
}) => {
    const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
    const { t } = useTranslation();
    const theme = useAppTheme();
    const insets: EdgeInsets = useAppSafeAreaInsets();
    const navigation = useNavigation();
    const [hasCalledLoadMore, setHasCalledLoadMore] = useState(false);

    const backAction = () => {
        navigation.goBack();
        if (onBack) {
            onBack();
        }
    };
    const getSelectTypeTitle = () => {
        switch (typeSelect) {
            case TransactionType.All:
                return LanguageKey.transaction_all_type;
            case TransactionType.Sent:
                return LanguageKey.home_send_title;
            case TransactionType.Receive:
                return LanguageKey.home_receive_title;
            default:
                break;
        }
    };

    const typeSelectTitle = getSelectTypeTitle();

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } =
            event.nativeEvent;

        const distanceToEnd =
            contentSize.height - (contentOffset.y + layoutMeasurement.height);

        if (distanceToEnd < -30 && !hasCalledLoadMore) {
            if (onLoadMore) {
                onLoadMore();
            }
            setHasCalledLoadMore(true);
        } else if (distanceToEnd >= -30 && hasCalledLoadMore) {
            setHasCalledLoadMore(false);
        }
    };

    return {
        t,
        insets,
        theme,
        lightMode,
        navigation,
        backAction,
        typeSelectTitle,
        handleScroll,
    };
};
