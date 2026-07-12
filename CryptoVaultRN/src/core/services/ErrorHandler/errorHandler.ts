import Utils from 'src/core/utils/commonUtils';
import errorData from './errorData';
import AppToastType from 'src/core/enum/AppToastType';
import AppI18Next from 'src/core/locales';

const showError = (errorCode: string) => {
    const errorMessage = errorData[errorCode as keyof typeof errorData];
    if (!errorMessage) return;
    return Utils.showToast({
        msg: AppI18Next.t(errorMessage),
        type: AppToastType.error,
    });
};

const ErrorHandler = {
    showError,
};
export default ErrorHandler;
