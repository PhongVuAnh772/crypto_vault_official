import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from 'src/components';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import {
    GuidingShieldSecuritySvgIcon,
    GuidingSwapSvgIcon,
    SwapGuidingSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import ButtonBottom from 'src/components/specific/ButtonBottom';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useGuiding from './guiding.hook';
import useGuidingStyles from './guiding.styles';

const GuidingSwapView: React.FC<RootNavigationType> = ({ navigation }) => {
    const { t } = useTranslation();
    const styles = useGuidingStyles();
    const { onTryASwap, onMaybeLater } = useGuiding({ navigation });

    const listGuiding = [
        {
            title: LanguageKey.swap_guiding_sub_title_1,
            icon: <GuidingSwapSvgIcon color={appColors.neutral.white} />,
        },
        {
            title: LanguageKey.swap_guiding_sub_title_2,
            icon: (
                <GuidingShieldSecuritySvgIcon color={appColors.neutral.white} />
            ),
        },
    ];
    return (
        <ScreenWrapper
            paddingTop
            backgroundColor={appColors.main.tokyoRed}
            enableHeader>
            <View style={[appStyles.flex1, appStyles.backgroundBlack]}>
                <ScrollView
                    contentContainerStyle={[
                        appStyles.pT5,
                        appStyles.pH25,
                        appStyles.flex1,
                    ]}>
                    <Animated.View
                        style={[appStyles.flex1]}
                        entering={FadeInDown.duration(1000)}>
                        <View style={appStyles.alignItemsCenter}>
                            <SwapGuidingSvgIcon />
                        </View>
                        <View style={appStyles.mt30}>
                            <View>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.swap_guiding_title
                                    }
                                    textColor={appColors.neutral.white}
                                    variant={TextVariantKeys.titleLarge}
                                    styles={appStyles.textAlignCenter}
                                />
                            </View>
                        </View>
                        <FlatList
                            data={listGuiding}
                            keyExtractor={item => item.title}
                            scrollEnabled={false}
                            style={appStyles.mt20}
                            renderItem={({ item }) => {
                                return (
                                    <View
                                        style={[
                                            appStyles.flexRow,
                                            appStyles.flex1,
                                            appStyles.alignItemsCenter,
                                            appStyles.justifyContentCenter,
                                        ]}>
                                        <View style={appStyles.flex1}>
                                            {item.icon}
                                        </View>
                                        <View style={appStyles.flex5}>
                                            <AppText
                                                titleWithI18n={item.title}
                                                textColor={
                                                    appColors.neutral.white
                                                }
                                                variant={
                                                    TextVariantKeys.bodyRMedium
                                                }
                                            />
                                        </View>
                                    </View>
                                );
                            }}
                            ItemSeparatorComponent={() => (
                                <View style={appStyles.mt20} />
                            )}
                        />
                    </Animated.View>
                </ScrollView>
                <ButtonBottom
                    onPress={onTryASwap}
                    title={t(LanguageKey.swap_try_a_swap)}>
                    <ButtonBottom
                        onPress={onMaybeLater}
                        title={t(LanguageKey.common_text_maybe_later)}
                        containerStyle={styles.buttonMaybeLater}
                        backgroundButtonColor={appColors.neutral.white}
                        textColor={appColors.main.tokyoRed}
                    />
                </ButtonBottom>
            </View>
        </ScreenWrapper>
    );
};

export default GuidingSwapView;
