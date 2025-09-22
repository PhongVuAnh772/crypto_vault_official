import { StackActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { ArrowRight2SvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppSelector } from 'src/core/redux/hooks';
import {
    getBalanceInfoByAccessToken,
    getUserInfo,
} from 'src/core/redux/slice/rezPoint/rezPoint.slice';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';
import { rezPointUtils } from 'src/core/utils/rezPoint';
import useLogin from 'src/features/rezPoints/auth/login/login.hook';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const RezPointBalance: React.FC<RootNavigationType> = ({ navigation }) => {
    const theme = useAppTheme();
    const colors = ['#474F66', '#69728A'];

    const userInfo = useAppSelector(getUserInfo);
    const isSignedIn = !!userInfo;

    const navigateToScreen = (screenKey: string, params?: any) => {
        navigation.dispatch(StackActions.push(screenKey, params));
    };
    const { login } = useLogin({ navigation });

    const onPress = () => {
        if (isSignedIn) {
            navigateToScreen(HomeStackScreenKey.RezPointStack);
        } else {
            login();
        }
    };
    const balanceInfo = useAppSelector(getBalanceInfoByAccessToken);
    const balanceRezPoint = rezPointUtils.formatCurrency(
        balanceInfo?.balance ?? 0,
    );
    const styleContent = [
        appStyles.flexRow,
        appStyles.justifyContentBetween,
        appStyles.fullWidth,
        appStyles.alignItemsCenter,
        styles.rezPointContent,
    ];
    const content = (
        <>
            <AppText
                titleWithI18n={
                    isSignedIn
                        ? `${balanceRezPoint}`
                        : LanguageKey.common_sign_in
                }
                variant={
                    isSignedIn
                        ? TextVariantKeys.titleMedium
                        : TextVariantKeys.bodyMSmall
                }
                textColor={theme.colors.text_on_surface_text_invert}
                numberOfLines={1}
                maxFontSizeMultiplier={1.4}
            />
            <MotiView
                from={{ translateX: -8 }}
                animate={{ translateX: 0 }}
                transition={{
                    type: 'timing',
                    duration: 500,
                    easing: Easing.out(Easing.exp),
                    delay: 100,
                    loop: true,
                }}>
                <ArrowRight2SvgIcon color={appColors.neutral.white} />
            </MotiView>
        </>
    );
    const ViewRezPoint: React.FC = () => {
        return (
            <>
                <AppText
                    titleWithI18n={LanguageKey.common_rez_point}
                    variant={TextVariantKeys.bodyRTiny}
                    textColor={theme.colors.text_on_surface_text_invert}
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.4}
                />
                <View
                    style={[
                        styles.contentAbsolute,
                        { bottom: isSignedIn ? 10 : 0 },
                    ]}>
                    {isSignedIn ? (
                        <View style={[styleContent]}>{content}</View>
                    ) : (
                        <LinearGradient
                            colors={colors}
                            start={{ x: 0.5, y: 1 }}
                            end={{ x: 0.5, y: 0 }}
                            style={styleContent}>
                            {content}
                        </LinearGradient>
                    )}
                </View>
            </>
        );
    };
    return (
        <Pressable
            onPress={onPress}
            style={styles.imageBackgroundRezPointBalance}>
            {GlobalUtils.getEnableRedXNewTheme() ? (
                <LinearGradient
                    colors={colors}
                    style={styles.imageBackgroundRezPointBalanceContainer}>
                    <ViewRezPoint />
                </LinearGradient>
            ) : (
                <ImageBackground
                    source={appImages.RezPointBalanceBackground}
                    imageStyle={styles.imageBackgroundRezPointBalance}
                    style={[styles.imageBackgroundRezPointBalanceContainer]}>
                    <ViewRezPoint />
                </ImageBackground>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    rezPointContent: {
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        paddingVertical: 5,
        paddingHorizontal: 12,
    },
    imageBackgroundRezPointBalance: {
        flex: 39,
        borderRadius: 4,
    },
    imageBackgroundRezPointBalanceContainer: {
        flex: 34,
        borderRadius: GlobalUtils.getEnableRedXNewTheme() ? 0 : 4,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    contentAbsolute: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default RezPointBalance;
