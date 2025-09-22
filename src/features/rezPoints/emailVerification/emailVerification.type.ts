import { RouteProp } from '@react-navigation/native';
import { RezPointStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { RezPointStackParamListType } from 'src/navigation/stacks/rezPoint/type';

export type EmailVerificationViewProps = RouteProp<
    RezPointStackParamListType,
    RezPointStackScreenKey.EmailVerification
>;
