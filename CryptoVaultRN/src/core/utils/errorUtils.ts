import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { sendContact } from 'src/features/setting/contact/contact.slice';
import {
    setActionFailedNeedToContact,
    setShowCommonErrorModal,
} from '../redux/slice/app.slice';
import createContextError, { ContextErrorType } from '../services/ContextError';

export type AppHandleErrorType = {
    dispatch: ThunkDispatch<unknown, unknown, UnknownAction>;
    contextData: ContextErrorType;
    isShowModal?: boolean;
    pushToBE?: boolean;
    logReason?: boolean;
};

const sendContactWhenError = (
    dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
    context: string,
) => {
    dispatch(
        sendContact({
            context,
            name: 'Mobile Auto Log',
            email: 'mobile-dev@gmail.com',
            inquiry: 'Mobile auto log error',
        }),
    );
};

const handleError = ({
    dispatch,
    contextData,
    isShowModal = true,
    pushToBE = true,
    logReason = true,
}: AppHandleErrorType) => {
    const context = createContextError({
        ...contextData,
    });
    if (logReason) {
        console.error(contextData.reason);
    }

    dispatch(setActionFailedNeedToContact(context));

    if (isShowModal) {
        dispatch(setShowCommonErrorModal(true));
    }
    if (pushToBE) {
        dispatch(
            sendContact({
                context,
                name: 'Mobile Auto Log',
                email: 'mobile-dev@gmail.com',
                inquiry: 'Mobile auto log error',
            }),
        );
    }
};

const AppErrorUtils = {
    sendContactWhenError,
    handleError,
};

export default AppErrorUtils;
