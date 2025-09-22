import React from 'react';
import { FlatList, Switch, View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import SearchEmptyCrypto from 'src/components/specific/SearchEmptyCrypto';
import appColors from 'src/core/constants/AppColors';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { TokenType } from 'src/core/redux/slice/customToken/addCustomToken.type';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import useStyles from './manageCrypto.style';
import { ManageListCryptoType } from './manageCrypto.type';

const ManageCrypto: React.FC<ManageListCryptoType> = ({
    tokenData,
    searching,
    isLoadingImages,
    setIsLoadingImage,
    handleOnChangeStatus,
}) => {
    const theme: AppThemeType = useAppTheme();
    const styles = useStyles(theme);

    const filteredData = tokenData.filter(item => {
        return searching
            ? item?.name?.toLowerCase().includes(searching.toLowerCase())
            : true;
    });

    const renderItem = ({ item }: { item: TokenType }) => {
        return (
            <View style={styles.item}>
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.alignItemsCenter,
                        appStyles.flex9,
                    ]}>
                    <AppImage
                        uri={item.logo ?? ''}
                        setIsLoading={setIsLoadingImage}
                        isLoading={isLoadingImages[item.logo ?? '']?.loading}
                        styleImage={styles.image}
                        skeletonRadius={100}
                        defaultImage={appImages.logo}
                    />
                    <View style={[appStyles.ml15, appStyles.flex1]}>
                        <AppText
                            title={item.name}
                            variant={TextVariantKeys.titleMedium}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                        />
                        <AppText
                            title={item.symbol}
                            variant={TextVariantKeys.bodyRTiny}
                            textColor={theme.colors.text_on_surface_text_medium}
                        />
                    </View>
                </View>
                <View style={[appStyles.flex2, appStyles.center]}>
                    <Switch
                        value={item.active}
                        onValueChange={() => {
                            handleOnChangeStatus(item);
                        }}
                        trackColor={{
                            false: theme.colors.text_on_surface_text_highest,
                            true: theme.colors.label_surface_button_pressed,
                        }}
                        thumbColor={appColors.neutral.white}
                        style={styles.switch}
                    />
                </View>
            </View>
        );
    };

    return (
        <FlatList
            data={filteredData}
            renderItem={renderItem}
            contentContainerStyle={appStyles.flexGrow1}
            keyExtractor={(item, index) => `${item?.name}_${index}`}
            ListEmptyComponent={
                <SearchEmptyCrypto
                    styles={[appStyles.flex1, styles.emptyView]}
                />
            }
            showsVerticalScrollIndicator={false}
        />
    );
};

export { ManageCrypto };
