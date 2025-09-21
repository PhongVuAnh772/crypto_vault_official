import Utils from 'src/core/utils/commonUtils';
import AppI18Next from 'src/core/locales';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';

const handleBEError = ({errorCode}: {errorCode: number}) => {
    switch (errorCode) {
        case 1000123:
            Utils.showToast({
                msg: AppI18Next.t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
            break;
        default:
            break;
    }
};

export {handleBEError};
