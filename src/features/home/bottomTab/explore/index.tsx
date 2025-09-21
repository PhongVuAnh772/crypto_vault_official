import React from 'react';
import {
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { ScreenWrapper } from 'src/components';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { FireSvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import DateTimeUtils from 'src/core/utils/dateTimeUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    EndReachedFooter,
    LoadingListView,
    RenderProjectClaimList,
} from './explore.component';
import { useExplore } from './explore.hook';
import useStyles from './explore.style';

const ExploreScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        theme,
        navigateToProjectDetail,
        dataListProject,
        refreshing,
        onRefresh,
        loadMore,
        handleLoadMore,
        firstLoading,
        firstLoadingList,
        t,
        newUI,
        navigatingToTop5EVMs,
        navigatingToTop5Tokens,
        enableLoadMore,
    } = useExplore({
        navigation,
    });
    const styles = useStyles(theme, newUI);
    return (
        <ScreenWrapper
            backgroundImage={
                newUI ? appImages.newBackground1 : appImages.background1
            }
            bounces
            paddingTop
            backgroundColor={appColors.main.tokyoRed}
            subStyle={[appStyles.flex1, appStyles.mt30, appStyles.mh25]}>
            <ScrollView
                style={appStyles.flex1}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={
                            newUI
                                ? appColors.neutral.white
                                : theme.colors.backdrop
                        }
                    />
                }
                showsVerticalScrollIndicator={false}
                onMomentumScrollEnd={event => {
                    const { contentOffset, layoutMeasurement, contentSize } =
                        event.nativeEvent;
                    if (
                        contentOffset.y + layoutMeasurement.height >=
                        contentSize.height - 50
                    ) {
                        handleLoadMore();
                    }
                }}>
                <View
                    style={[
                        appStyles.mt25,
                        appStyles.flexRow,
                        appStyles.alignItemsCenter,
                        styles.title,
                    ]}>
                    <AppText
                        titleWithI18n={LanguageKey.chart_title}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_high}
                        maxFontSizeMultiplier={1.2}
                    />
                    <View style={[appStyles.pl5, !newUI && styles.fire]}>
                        <FireSvgIcon />
                    </View>
                </View>
                <View style={[appStyles.flexRow, appStyles.mv10]}>
                    <Pressable
                        style={styles.button}
                        onPress={navigatingToTop5Tokens}>
                        <FastImage
                            source={appImages.Top5NFTs}
                            style={styles.chartTopImage}
                            defaultSource={appImages.NFTDefault}
                            resizeMode="stretch"
                        />
                        <AppText
                            titleWithI18n={LanguageKey.top_10_tokens}
                            variant={TextVariantKeys.titleSmall}
                            styles={styles.top5NFTsText}
                            textColor={appColors.neutral.white}
                            maxFontSizeMultiplier={1.2}
                        />
                    </Pressable>
                    <View style={styles.separator} />
                    <Pressable
                        style={styles.button}
                        onPress={navigatingToTop5EVMs}>
                        <FastImage
                            source={appImages.Top5EVMs}
                            style={styles.chartTopImage}
                            defaultSource={appImages.NFTDefault}
                            resizeMode="stretch"
                        />
                        <AppText
                            titleWithI18n={LanguageKey.top_10_protocols}
                            variant={TextVariantKeys.titleSmall}
                            styles={styles.top5NFTsText}
                            textColor={appColors.neutral.white}
                            maxFontSizeMultiplier={1.2}
                        />
                    </Pressable>
                </View>
                <View style={[appStyles.mt15, styles.title]}>
                    <AppText
                        titleWithI18n={LanguageKey.claim_token_title}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_high}
                    />
                </View>
                {dataListProject && dataListProject.length > 0 ? (
                    <FlatList
                        data={dataListProject}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <RenderProjectClaimList
                                item={item}
                                theme={theme}
                                navigateToProjectDetail={
                                    navigateToProjectDetail
                                }
                                formatDateToDDMM={
                                    DateTimeUtils.formatDateToDDMM
                                }
                                formatDateToCustomFormat={
                                    DateTimeUtils.formatDateToCustomFormat
                                }
                                isOngoing={DateTimeUtils.isOngoing}
                                isUpComing={DateTimeUtils.isUpComing}
                                t={t}
                                firstLoading={firstLoading}
                            />
                        )}
                        ListFooterComponent={
                            enableLoadMore ? (
                                <EndReachedFooter
                                    loadMore={loadMore}
                                    theme={theme}
                                    newUI={newUI}
                                />
                            ) : null
                        }
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <LoadingListView
                        isLoading={firstLoadingList}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

export default ExploreScreen;
