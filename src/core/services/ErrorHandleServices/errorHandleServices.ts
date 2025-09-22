import Utils from 'src/core/utils/commonUtils';
import {pushErrorEventToAnalytics} from '../FirebaseAnalytics';
import {ThirdPartyService} from '../FirebaseAnalytics/type';
import AppI18Next from 'src/core/locales';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';

const handleServicesError = ({
    error,
    thirdPartyName,
}: {
    error: string;
    thirdPartyName: ThirdPartyService;
}) => {
    Utils.showToast({
        msg: AppI18Next.t(LanguageKey.common_server_busy),
        type: AppToastType.error,
    });

    pushErrorEventToAnalytics({
        error: error,
        thirdPartyName: thirdPartyName,
    });
};

export {handleServicesError};
