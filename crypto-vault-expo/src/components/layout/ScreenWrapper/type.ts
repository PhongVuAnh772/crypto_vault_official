import { ReactElement } from 'react';
import {
    GestureResponderEvent,
    ImageSourcePropType,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControlProps,
    StyleProp,
    ViewStyle,
} from 'react-native';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { AppThemeType } from 'src/core/type/ThemeType';

type ScreenWrapperProps = {
    children: React.ReactNode;
    scrollEnabled?: boolean;
    bounces?: boolean;
    paddingTop?: boolean;
    headerPaddingTop?: boolean;
    paddingBottom?: boolean;
    mainStyle?: StyleProp<ViewStyle>;
    subStyle?: StyleProp<ViewStyle>;
    theme: AppThemeType;
    backgroundColor?: string;
    backAction?: (event: GestureResponderEvent) => void;
    enableHeader?: boolean;
    headerTextVariant?: TextVariantKeys;
    headerTitle?: string;
    headerTitleWithI18n?: string;
    headerTextColor?: string;
    backButtonColor?: string;
    enableDismissKeyboard?: boolean;
    backgroundImage?: ImageSourcePropType;
    onDismissKeyboard?: () => void;
    iconRight?: React.ReactNode;
    showScanQRCamera?: boolean;
    maxFontSizeMultiplier?: number;
    headerStyle?: StyleProp<ViewStyle>;
    enableWidthLimit?: boolean;
    styleWidthLimitContainer?: StyleProp<ViewStyle>;
    hiddenBackAction?:boolean;
    callBackWhenScanQR?: (data: string) => void;
    onCloseScanQR?: () => void;
    refreshControl?: ReactElement<RefreshControlProps>;
    onMomentumScrollEnd?: (
        event: NativeSyntheticEvent<NativeScrollEvent>,
    ) => void;
};
export default ScreenWrapperProps;
