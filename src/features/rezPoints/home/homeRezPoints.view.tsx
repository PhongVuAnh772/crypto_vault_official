import React from 'react';
import {
    FlatList,
    ImageBackground,
    RefreshControl,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';
import AppModal from 'src/components/common/AppModal';
import ParallaxScrollView from 'src/components/layout/ParallaxScrollView';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import {
    LogOutRezPointsSvgIcon,
    PersonSvgIcon,
    SignOutOptionSvgIcon,
    StarSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    HeaderSection,
    LoadingContent,
    LoadingHeader,
    PointExpiryDateList,
    RezPointOptions,
    UserInfo,
} from './homeRezPoints.component';
import useRezPointHome from './homeRezPoints.hook';
import { useStyles } from './homeRezPoints.style';

const RezPointMainScreen = ({ navigation }: RootNavigationType) => {
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const styles = useStyles(theme);
    const { fontScale } = useWindowDimensions();
    const {
        coin,
        handleOpenOptionModal,
        showModalSignOut,
        handleSignOut,
        handleSignOutOption,
        bottomSheetRef,
        handleCloseModalSignOut,
        userName,
        backAction,
        handleNavigationPersonalInformation,
        getPointExpireInfo,
        isLoading,
        onRefresh,
        refreshing,
        goToPointHistory,
        navigateAboutScreen,
    } = useRezPointHome({ navigation });

    const listOption = [
        {
            icon: (
                <PersonSvgIcon
                    color={theme.colors.text_on_surface_text_medium}
                />
            ),
            titleWithI18n: LanguageKey.common_personal_information,
            onPress: handleNavigationPersonalInformation,
        },
        {
            icon: (
                <StarSvgIcon color={theme.colors.text_on_surface_text_medium} />
            ),
            titleWithI18n: LanguageKey.rez_point_about,
            onPress: navigateAboutScreen,
        },
        {
            icon: (
                <SignOutOptionSvgIcon
                    color={theme.colors.text_on_surface_text_medium}
                />
            ),
            titleWithI18n: LanguageKey.common_sign_out,
            onPress: handleSignOutOption,
        },
    ];

    return (
        <ParallaxScrollView
            showIndicator={false}
            headerHeightImage={fontScale > 1.1 ? 290 : 270}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing || false}
                    onRefresh={onRefresh}
                    style={appStyles.z999}
                    progressViewOffset={insets.top}
                />
            }
            headerImage={
                <ImageBackground
                    source={appImages.RezPointMainBackground}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                />
            }
            headerAbsolute={
                <HeaderSection
                    backAction={backAction}
                    handleOpenOptionModal={handleOpenOptionModal}
                />
            }
            contentStyle={styles.contentStyle}
            contentInsideHeader={
                <LoadingHeader isLoading={isLoading.balance}>
                    <UserInfo
                        userName={userName}
                        coin={coin}
                        coinExpire={getPointExpireInfo?.pointExpiringLatest}
                        theme={theme}
                        onPressPointHistory={goToPointHistory}
                    />
                </LoadingHeader>
            }>
            <View style={[styles.wrapper]}>
                <LoadingContent
                    isLoading={isLoading.listPointExpire}
                    insets={insets}
                    theme={theme}>
                    <View style={[styles.containerContent]}>
                        <PointExpiryDateList
                            data={getPointExpireInfo?.listPointExpiring ?? []}
                        />
                    </View>
                </LoadingContent>
            </View>

            <BottomSheetModalGorhom
                refModal={bottomSheetRef}
                snapPoints={['30']}>
                <View style={[appStyles.flex1]}>
                    <FlatList
                        data={listOption}
                        contentContainerStyle={styles.bottomSheetContent}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => (
                            <RezPointOptions
                                icon={item.icon}
                                titleWithI18n={item.titleWithI18n}
                                onPress={item.onPress}
                            />
                        )}
                        ItemSeparatorComponent={() => (
                            <View style={styles.separator} />
                        )}
                        bounces={false}
                    />
                </View>
            </BottomSheetModalGorhom>
            <AppModal
                titleWithI18n={LanguageKey.common_sign_out}
                subTitleWithI18n={LanguageKey.rez_point_sign_out_sub_title}
                visible={showModalSignOut}
                onPress={handleSignOut}
                buttonTitleWithI18n={LanguageKey.common_text_confirm}
                onPress2={handleCloseModalSignOut}
                twoOptions={true}
                buttonTitleWithI18n2={LanguageKey.common_text_cancel}
                icon={<LogOutRezPointsSvgIcon />}
                textButtonSecondColor={
                    theme.colors.text_on_surface_text_brand_2
                }
                buttonSecondContainerStyle={styles.cancelButton}
            />
        </ParallaxScrollView>
    );
};

export default RezPointMainScreen;
