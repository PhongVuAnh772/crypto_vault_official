import { StyleProp, ViewStyle } from 'react-native';

export type RezPointOptionsHeaderProps = {
    title: string;
    closeModal: () => void;
};

export type RezPointOptionsProps = {
    onPress: () => void;
    titleWithI18n: string;
    icon: React.ReactNode;
    textColor?: string;
    containerStyle?: StyleProp<ViewStyle>;
};
export type HeaderSectionProps = {
    backAction: () => void;
    handleOpenOptionModal: () => void;
};
export type LoadingView = {
    children: React.ReactNode;
    isLoading: boolean;
};
export type LoadingPage = {
    balance: boolean;
    listPointExpire: boolean;
};
export enum ErrorSignOut {
    NoCredentials = 'No credentials',
}
