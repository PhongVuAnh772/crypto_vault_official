import React from 'react';
import { FlatList, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import useStyles from 'src/features/selectToken/selectToken.style';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    EmptyView,
    HeaderListTopTokens,
    RenderTopItem,
    TopTokenLoading,
} from '../Tokens/tokens.components';
import useTop10Tokens from './tokens.hook';

const Top10Tokens: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        theme,
        top10TokensData,
        newUI,
        setLoadingImages,
        isLoadingImages,
        handleFiatConverted,
        loading,
        backAction,
        refreshing,
        handleRefreshing,
    } = useTop10Tokens({
        navigation,
    });

    const styles = useStyles(theme);

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
            headerTitleWithI18n={LanguageKey.top_10_tokens}>
            <View style={styles.headerContainer}>
                {!loading ? (
                    <FlatList
                        data={top10TokensData}
                        keyExtractor={item => `${item.contract_address}`}
                        contentContainerStyle={styles.listContentContainer}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <RenderTopItem
                                item={item}
                                index={`${index + 1}`}
                                setLoadingImages={setLoadingImages}
                                loadingImages={isLoadingImages}
                                newUI={newUI}
                                handleFiatConverted={handleFiatConverted}
                            />
                        )}
                        ListHeaderComponent={
                            top10TokensData !== null &&
                            top10TokensData.length ? (
                                <HeaderListTopTokens newUI={newUI} />
                            ) : null
                        }
                        onRefresh={handleRefreshing}
                        refreshing={refreshing}
                        ListEmptyComponent={EmptyView}
                    />
                ) : (
                    <TopTokenLoading newUI={newUI} />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default Top10Tokens;
