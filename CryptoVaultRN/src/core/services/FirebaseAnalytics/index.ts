import analytics from '@react-native-firebase/analytics';
import AppToastType from 'src/core/enum/AppToastType';
import AppI18Next from 'src/core/locales';
import LanguageKey from 'src/core/locales/LanguageKey';
import Utils from 'src/core/utils/commonUtils';
import { PushEventThirdPartyServiceType } from './type';

// Define keywords to check for in error messages
const keyWords = ['Upgrade', 'limit', 'pricing'];

// Function to push error events to Firebase Analytics
const pushErrorEventToAnalytics = async ({
    error,
    thirdPartyName,
}: PushEventThirdPartyServiceType) => {
    console.log('====================================');
    console.log('PushErrorEventToAnalytics');
    console.error('Error', error);

    const checkError = containsKeywords(error);
    if (!checkError) {
        console.error('Error not contains keywords [Upgrade, limit, pricing]');
        return;
    }

    Utils.showToast({
        msg: AppI18Next.t(LanguageKey.common_server_busy),
        type: AppToastType.error,
    });
    await analytics()
        .logEvent(`${thirdPartyName}_third_party_error`, {
            name_service: thirdPartyName,
            message: `${thirdPartyName}: ${error}`,
        })
        .then(() => {
            console.log('Push Error Event To Analytics Done');
        });
};

// Function to check if a text string contains any of the defined keywords
const containsKeywords = (text: string): boolean => {
    // Convert the input text to lowercase for case-insensitive comparison
    const lowerCaseText = text.toLowerCase();

    // Check if any of the keywords (converted to lowercase) are present in the lowercase text
    return keyWords.some(keyword =>
        lowerCaseText.includes(keyword.toLowerCase()),
    );
};

export { pushErrorEventToAnalytics };
