import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Toast, { BaseToastProps } from 'react-native-toast-message';

import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appColors from '../../core/constants/AppColors';
import {
    ToastErrorSvgIcon,
    ToastSuccessSvgIcon,
    ToastWarningSvgIcon,
} from '../../core/constants/AppIconsSvg';
import appStyles from '../../core/styles';
import AppImage from '../common/AppImage';
import AppText from '../common/AppText';
import styles from './styles';

type ToastViewType = {
    props: BaseToastProps;
    icon: ReactNode;
    currentStyles: StyleProp<ViewStyle>;
};

const ToastView: React.FC<ToastViewType> = ({ props, icon, currentStyles }) => {
    return (
        <View style={[appStyles.pH25, appStyles.fullWidth]}>
            <View style={[styles.container, currentStyles, appStyles.flexRow]}>
                <View style={appStyles.mh15}>{icon}</View>
                <View style={appStyles.flex1}>
                    <AppText
                        title={props.text1}
                        variant={TextVariantKeys.titleSmall}
                        textColor={appColors.neutral.black}
                    />
                    {props.text2 ? (
                        <AppText
                            title={props.text2}
                            variant={TextVariantKeys.bodyRLarge}
                            textColor={appColors.neutral.black}
                        />
                    ) : null}
                </View>
            </View>
        </View>
    );
};

const ToastViewProtocol: React.FC<ToastViewType> = ({ props }) => {
    return (
        <View style={[appStyles.pH25, appStyles.fullWidth]}>
            <View
                style={[
                    styles.container,
                    appStyles.flexRow,
                    appStyles.pH15,
                    styles.success,
                ]}>
                <AppImage uri={props.text2} styleImage={styles.protocolImage} />
                <AppText
                    title={props.text1}
                    variant={TextVariantKeys.titleSmall}
                    textColor={appColors.neutral.n600}
                />
            </View>
        </View>
    );
};
const ToastConfig = {
    success: (props: BaseToastProps) => (
        <ToastView
            props={props}
            icon={<ToastSuccessSvgIcon />}
            currentStyles={styles.success}
        />
    ),
    error: (props: BaseToastProps) => (
        <ToastView
            props={props}
            icon={<ToastErrorSvgIcon />}
            currentStyles={styles.error}
        />
    ),
    info: (props: BaseToastProps) => (
        <ToastView
            props={props}
            icon={<ToastWarningSvgIcon />}
            currentStyles={styles.warning}
        />
    ),
    changeProtocol: (props: BaseToastProps) => (
        <ToastViewProtocol
            props={props}
            icon={<ToastWarningSvgIcon />}
            currentStyles={styles.warning}
        />
    ),
};

const AppToast = () => (
    <Toast config={ToastConfig} position="bottom" visibilityTime={3000} />
);

export default AppToast;
