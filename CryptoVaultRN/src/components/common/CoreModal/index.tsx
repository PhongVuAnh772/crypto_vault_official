import React, { useEffect } from 'react';
import { Modal } from 'react-native';
import ForceUpdateModal from 'src/components/layout/ForceUpdateModal';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    selectorIsModalShow,
    setIsModalShow,
} from 'src/core/redux/slice/app.slice';

type CoreModalType = {
    visible: boolean;
    children: React.ReactNode;
    subModal?: React.ReactNode;
    onDismiss?: () => void;
    transparent?: boolean;
    animationType?: 'none' | 'fade' | 'slide';
    showRequirePinCode?: boolean;
};

const CoreModal: React.FC<CoreModalType> = ({
    visible,
    onDismiss,
    children,
    subModal,
    animationType,
    transparent,
    showRequirePinCode = true,
}) => {
    const isModalShow = useAppSelector(selectorIsModalShow);
    const dispatch = useAppDispatch();
    useEffect(() => {
        
        
        if (visible !== isModalShow) {
            dispatch(setIsModalShow(visible));
        }
        return()=>{
            dispatch(setIsModalShow(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);
    return (
        <Modal
            statusBarTranslucent
            transparent={transparent}
            animationType={animationType}
            visible={visible}
            onDismiss={() => {
                onDismiss && onDismiss();
            }}>
            <>{children}</>
            <ForceUpdateModal />
            <RequirePinCodeLayout subVisible={showRequirePinCode} />
            {subModal}
        </Modal>
    );
};

export default CoreModal;
