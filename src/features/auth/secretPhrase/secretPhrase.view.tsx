import React from 'react';
import {
    FlatList,
    ImageBackground,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { CopySvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import useSecretPhrase from 'src/features/auth/secretPhrase/secretPhrase.hook';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useStyles from './secretPhrase.styles';

const SecretPhrase: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        mnemonicData,
        continueAction,
        copyAction,
        handleLayout,
        isSwitchOn,
        themeMode,
        theme,
        insets,
        widthView,
        newUI,
        onToggleSwitch,
    } = useSecretPhrase({
        navigation,
    });

    const styles = useStyles(theme);

    const renderItem = ({ item, index }: { item: string; index: number }) => {
        return (
            <View
                style={
                    newUI ? styles.newSecretPhraseItem : styles.secretPhraseItem
                }>
                <View style={styles.secretPhraseItemViewIndex}>
                    <AppText
                        title={(index + 1).toString()}
                        maxFontSizeMultiplier={1.2}
                        variant={TextVariantKeys.bodyRSmall}
                        textColor={theme.colors.text_on_surface_text_high}
                    />
                </View>
                <View style={styles.secretPhraseItemViewPhrase}>
                    <View style={styles.secretPhraseItemViewPhrase2}>
                        <AppText
                            allowFontScaling={false}
                            title={item}
                            variant={TextVariantKeys.labelSmall}
                            textColor={theme.colors.text_on_surface_text_high}
                        />
                    </View>
                </View>
            </View>
        );
    };

    const newRenderItem = ({
        item,
        index,
    }: {
        item: string;
        index: number;
    }) => {
        return (
            <View
                style={[appStyles.flex1, appStyles.pd5]}
                onLayout={handleLayout}>
                {renderItem({ item: item, index: index })}
                {SvgView.view({
                    height: 40,
                    backgroundColor: 'white',
                    widthView: widthView,
                })}
            </View>
        );
    };
    return (
        <ScreenWrapper
            paddingTop
            enableHeader
            headerTitleWithI18n={LanguageKey.secret_phrase_risk_header}
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTextColor={
                newUI
                    ? appColors.neutral.white
                    : theme.colors.text_on_surface_text_highest
            }
            backgroundImage={
                newUI
                    ? undefined
                    : themeMode
                      ? appImages.background1
                      : appImages.background1Dark
            }
            backgroundColor={
                newUI ? appColors.main.tokyoRed : appColors.neutral.n100
            }
            backButtonColor={
                newUI ? appColors.neutral.white : appColors.neutral.black
            }>
            <ImageBackground
                style={appStyles.flex1}
                source={newUI ? appImages.newBackground1 : undefined}>
                <View style={[appStyles.alignItemsCenter, appStyles.flex1]}>
                    <View style={[appStyles.mbt25, appStyles.pH25]}>
                        {newUI ? (
                            <View
                                style={[styles.newThemeOpacity, appStyles.mh25]}
                            />
                        ) : null}
                        <AppText
                            titleWithI18n={LanguageKey.secret_phrase_sub_title}
                            variant={TextVariantKeys.bodyRLarge}
                            styles={[
                                appStyles.textAlignCenter,
                                newUI ? appStyles.pv16 : null,
                                {
                                    backgroundColor: newUI
                                        ? appColors.other.transparentNewUI
                                        : undefined,
                                },
                            ]}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                        />
                    </View>
                    <View style={[appStyles.fullWidth, appStyles.pH25]}>
                        <FlatList
                            scrollEnabled={false}
                            style={appStyles.fullWidth}
                            data={mnemonicData}
                            renderItem={newUI ? newRenderItem : renderItem}
                            keyExtractor={(_, index) => index.toString()}
                            numColumns={3}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={copyAction}
                        style={[
                            appStyles.center,
                            appStyles.flexRow,
                            appStyles.mt25,
                            appStyles.pH25,
                        ]}>
                        <View style={[appStyles.mr10, appStyles.center]}>
                            <CopySvgIcon
                                color={
                                    newUI
                                        ? theme.colors.text_on_surface_text_high
                                        : appColors.main.tokyoRed
                                }
                            />
                        </View>
                        <AppText
                            titleWithI18n={
                                LanguageKey.secret_phrase_copy_clipboard
                            }
                            variant={TextVariantKeys.bodyMMedium}
                            styles={appStyles.textAlignCenter}
                            textColor={
                                newUI
                                    ? theme.colors.text_on_surface_text_high
                                    : theme.colors.label_surface_button_primary
                            }
                        />
                    </TouchableOpacity>
                    <AppText
                        titleWithI18n={LanguageKey.create_new_wallet_warning}
                        variant={TextVariantKeys.bodyMMedium}
                        styles={[
                            appStyles.textAlignCenter,
                            appStyles.mt15,
                            appStyles.pH15,
                        ]}
                        textColor={
                            newUI
                                ? theme.colors.text_on_surface_text_high
                                : theme.colors.label_surface_button_primary
                        }
                    />
                    <View
                        style={[
                            appStyles.flex1,
                            appStyles.fullWidth,
                            appStyles.justifyContentEnd,
                        ]}>
                        <View
                            style={[
                                appStyles.pH25,
                                appStyles.pT12,
                                { paddingBottom: insets.bottom },
                            ]}>
                            {newUI ? (
                                <View style={styles.newThemeOpacity} />
                            ) : null}
                            <View
                                style={[
                                    appStyles.center,
                                    appStyles.flexRow,
                                    appStyles.mbt15,
                                ]}>
                                <View style={appStyles.mr10}>
                                    <Switch
                                        value={isSwitchOn}
                                        onValueChange={onToggleSwitch}
                                        trackColor={{
                                            false: appColors.neutral.n400,
                                            true: appColors.neutral.n800,
                                        }}
                                        thumbColor={appColors.neutral.white}
                                        style={styles.switch}
                                    />
                                </View>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.secret_phrase_written_title
                                    }
                                    variant={TextVariantKeys.bodyMMedium}
                                    styles={appStyles.textAlignCenter}
                                    textColor={
                                        theme.colors.text_on_surface_text_high
                                    }
                                />
                            </View>
                            {newUI ? (
                                <AppButtonSVG
                                    disabled={!isSwitchOn}
                                    onPress={continueAction}
                                    titleWithI18n={
                                        LanguageKey.common_text_continue
                                    }
                                    styles={styles.button}
                                    textVariant={TextVariantKeys.titleSmall}
                                    textColor={appColors.neutral.white}
                                    SvgView={SvgView.button}
                                />
                            ) : (
                                <AppButton
                                    disabled={!isSwitchOn}
                                    onPress={continueAction}
                                    titleWithI18n={
                                        LanguageKey.common_text_continue
                                    }
                                    styles={styles.button}
                                    textVariant={TextVariantKeys.titleSmall}
                                    textColor={appColors.neutral.white}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </ScreenWrapper>
    );
};

export default SecretPhrase;
