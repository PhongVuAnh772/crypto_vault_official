import { Credentials } from 'react-native-auth0';
import { RezPointStackScreenKey } from 'src/navigation/enum/NavigationKey';

export type RezPointStackParamListType = {
    [RezPointStackScreenKey.RezPointMainScreen]: undefined;
    [RezPointStackScreenKey.RezPointHistoryScreen]: undefined;
    [RezPointStackScreenKey.PersonalInformation]: undefined;
    [RezPointStackScreenKey.PointHistory]: undefined;
    [RezPointStackScreenKey.AboutRezPoint]: undefined;
    [RezPointStackScreenKey.EmailVerification]: Credentials;
    [RezPointStackScreenKey.EmailVerifiedSuccessfully]: undefined;
};
