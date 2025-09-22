import React from 'react';
import { FlatList, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    EmptyView,
    HeaderListTopEVMs,
    LoadingView,
    RenderTopItem,
} from './evm.components';
import useTop10EVMs from './evm.hook';
import useStyle from './evm.styles';

const Top10EVMs: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        theme,
        top10EVMsData,
        setLoadingImages,
        isLoadingImages,
        newUI,
        handleFiatConverted,
        backAction,
        loading,
        handleRefreshing,
        refreshing,
    } = useTop10EVMs({
        navigation,
    });

    const styles = useStyle(theme);

    return (
        <ScreenWrapper
            paddingTop
            backAction={backAction}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }
            enableHeader
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTitleWithI18n={LanguageKey.top_10_protocols}>
            <View style={styles.container}>
                {!loading ? (
                    <FlatList
                        onRefresh={handleRefreshing}
                        refreshing={refreshing}
                        data={top10EVMsData}
                        keyExtractor={(item, index) => `${item.name + index}`}
                        contentContainerStyle={styles.listContentContainer}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <RenderTopItem
                                item={item}
                                index={`${index + 1}`}
                                setLoadingImages={setLoadingImages}
                                loadingImages={isLoadingImages}
                                handleFiatConverted={handleFiatConverted}
                            />
                        )}
                        ListHeaderComponent={
                            top10EVMsData !== null && top10EVMsData.length ? (
                                <HeaderListTopEVMs />
                            ) : null
                        }
                        ListEmptyComponent={EmptyView}
                    />
                ) : (
                    <LoadingView />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default Top10EVMs;
