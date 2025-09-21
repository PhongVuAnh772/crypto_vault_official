import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import LoadingScreen from 'src/components/common/LoadingScreen';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { WarnSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useConfirmSecretPhrase, { ItemType } from './confirmSecretPhrase.hook';
import useStyles from './confirmSecretPhrase.styles';

const ConfirmSecretPhrase: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        getResult,
        handleSelectOption,
        modalVisible,
        setModalVisible,
        questionData,
        actionConfirm,
        results,
        theme,
        isLoading,
        insets,
        newUI,
    } = useConfirmSecretPhrase({
        navigation,
    });

    const styles = useStyles(theme, insets);

    const renderItem = ({ item }: { item: ItemType }) => {
        const result = getResult(item.index);

        return (
            <View style={appStyles.mbt25}>
                <View style={styles.questionContainer}>
                    <View style={styles.option}>
                        {item.options.map((option, index) => {
                            const isSelected = result?.selected === option;
                            return (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => {
                                        handleSelectOption(item, option);
                                    }}
                                    style={[
                                        index === 1 ? appStyles.mh10 : null,
                                        styles.optionItem,
                                        {
                                            backgroundColor: isSelected
                                                ? appColors.functional.green
                                                : theme.colors
                                                      .surface_surface_high,
                                        },
                                    ]}>
                                    <AppText
                                        title={option}
                                        textColor={
                                            isSelected
                                                ? theme.colors
                                                      .surface_surface_high
                                                : theme.colors
                                                      .text_on_surface_text_high
                                        }
                                        variant={TextVariantKeys.bodyMMedium}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
                <View style={styles.questionContainer2}>
                    <View
                        style={[
                            styles.questionTitle,
                            newUI ? styles.bdr0 : styles.bdr100,
                        ]}>
                        <AppText
                            title={item.question}
                            variant={TextVariantKeys.bodyRSmall}
                            textColor={theme.colors.text_on_surface_text_high}
                        />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            headerTitleWithI18n={LanguageKey.secret_phrase_risk_header}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_high
            }
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            headerTextColor={
                newUI
                    ? appColors.neutral.white
                    : theme.colors.text_on_surface_text_highest
            }>
            <AppModal
                visible={modalVisible}
                onPress={() => {
                    setModalVisible(!modalVisible);
                }}
                titleWithI18n={
                    LanguageKey.confirm_secret_phrase_incorrect_title
                }
                subTitleWithI18n={
                    LanguageKey.confirm_secret_phrase_incorrect_sub_title
                }
                buttonTitleWithI18n={LanguageKey.common_text_try_again}
                icon={<WarnSvgIcon />}
            />
            <View style={styles.container}>
                <View style={[appStyles.mh15, appStyles.mv25]}>
                    <AppText
                        titleWithI18n={
                            LanguageKey.confirm_secret_phrase_sub_title
                        }
                        variant={TextVariantKeys.bodyRLarge}
                        styles={appStyles.textAlignCenter}
                        textColor={theme.colors.text_on_surface_text_medium}
                    />
                </View>
                <FlatList
                    style={appStyles.fullWidth}
                    scrollEnabled
                    bounces={false}
                    data={questionData}
                    renderItem={renderItem}
                    keyExtractor={(_, index) => index.toString()}
                />
                {newUI ? (
                    <AppButtonSVG
                        onPress={actionConfirm}
                        disabled={results?.length !== 4}
                        titleWithI18n={LanguageKey.common_text_confirm}
                        styles={styles.button}
                        textVariant={TextVariantKeys.titleSmall}
                        textColor={appColors.neutral.white}
                        SvgView={SvgView.button}
                    />
                ) : (
                    <AppButton
                        onPress={actionConfirm}
                        disabled={results?.length !== 4}
                        titleWithI18n={LanguageKey.common_text_confirm}
                        styles={styles.button}
                        textVariant={TextVariantKeys.titleSmall}
                        textColor={appColors.neutral.white}
                    />
                )}
            </View>
            <LoadingScreen visible={isLoading} />
        </ScreenWrapper>
    );
};

export default ConfirmSecretPhrase;
