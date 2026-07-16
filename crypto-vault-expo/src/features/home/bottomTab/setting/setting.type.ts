import { ReactNode } from 'react';
import { SvgProps } from 'react-native-svg';

export type describe = {
    icon: React.FC<SvgProps>;
    title: string;
    onPress: () => void | Promise<void>;
    rightView?: ReactNode;
};
export type SettingListType = {
    title?: string;
    data?: describe[];
};
export type ListSettingType = {
    listScreen: SettingListType[];
};
