import React from 'react';
import { Image } from 'react-native';
import { ScreenWrapper } from 'src/components';
import LoadingScreen from 'src/components/common/LoadingScreen';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import appColors from 'src/core/constants/AppColors';
import { appImages } from 'src/core/constants/AppImages';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useSplash from './splashScreen.hook';
import styles from './splashScreen.styles';

const SplashScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const { showRequirePinCode, actionAfterPassPinCode, loading } = useSplash({
        navigation,
    });

    return (
        <>
            <ScreenWrapper
                mainStyle={[styles.container, appStyles.flex1]}
                subStyle={[appStyles.flex1, appStyles.center]}
                backgroundColor={appColors.neutral.black}>
                <Image
                    source={appImages.logo}
                    style={appStyles.iconCircleSize100}
                />
            </ScreenWrapper>
            <RequirePinCodeLayout
                visible={showRequirePinCode}
                continueActionAfterPassPinCode={actionAfterPassPinCode}
            />
            <LoadingScreen visible={loading} />
        </>
    );
};

export default SplashScreen;
