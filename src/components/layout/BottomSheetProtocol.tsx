import React from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LoadingImage } from 'src/components/common/AppImage/type';
import AppSeparator from 'src/components/common/AppSeparator';
import AppText from 'src/components/common/AppText';
import ProtocolItem from 'src/components/homeComponents/ProtocolItem';
import appColors from 'src/core/constants/AppColors';
import { Close2SvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

type BottomSheetProtocolViewType = {
    onCloseModalProtocol: () => void | undefined;
    protocolDataLists: ProtocolDataWithSupportedTokensFormBEType[] | undefined;
    handlePressProtocol: (
        data: ProtocolDataWithSupportedTokensFormBEType,
    ) => void;
    selectedProtocolId?: string;
    isLoadingImages: LoadingImage;
    setLoadingImages: (uri: string, value: boolean) => void;
    refreshList: boolean;
    onRefresh?: () => void;
};

const BottomSheetProtocolView: React.FC<BottomSheetProtocolViewType> = ({
    onCloseModalProtocol,
    protocolDataLists,
    handlePressProtocol,
    selectedProtocolId,
    isLoadingImages,
    setLoadingImages,
    refreshList,
    onRefresh,
}) => {
    const theme = useAppTheme();
    const styles = useStyle(theme);

    return (
        <View style={styles.container}>
            <View style={appStyles.center}>
                <AppText
                    titleWithI18n={LanguageKey.wallet_address_select_protocol}
                    variant={TextVariantKeys.titleLarge}
                    styles={[appStyles.textAlignCenter]}
                    textColor={theme.colors.text_on_surface_text_highest}
                />
            </View>
            <TouchableOpacity
                activeOpacity={0.7}
                style={styles.closeIconStyle}
                onPress={onCloseModalProtocol}>
                <Close2SvgIcon
                    color={theme.colors.text_on_surface_text_high}
                />
            </TouchableOpacity>
            <View style={styles.protocolList}>
                <FlatList
                    data={protocolDataLists}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={item => item?._id.toString()}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                No protocol available for current network.
                            </Text>
                        </View>
                    }
                    refreshControl={
                        refreshList && onRefresh ? (
                            <RefreshControl
                                refreshing={refreshList}
                                onRefresh={onRefresh}
                            />
                        ) : undefined
                    }
                    renderItem={({ item }) => {
                        const selected = item._id === selectedProtocolId;
                        return (
                            <ProtocolItem
                                item={item}
                                selected={selected}
                                onPress={handlePressProtocol}
                                theme={theme}
                                isLoadingImage={isLoadingImages}
                                setLoadingImages={setLoadingImages}
                            />
                        );
                    }}
                    ItemSeparatorComponent={AppSeparator}
                />
            </View>
        </View>
    );
};

const useStyle = (theme: AppThemeType) =>
    StyleSheet.create({
        closeIconStyle: { position: 'absolute', right: 25, top: -5 },
        protocolList: {
            shadowColor: appColors.neutral.n500,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
            ...appStyles.mt15,
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 4,
            borderColor: theme.colors.outline_outine,
            borderWidth: 0.6,
            marginBottom: 70,
        },
        container: {
            ...appStyles.pH25,
            ...appStyles.mt10,
            ...appStyles.flex1,
        },
        emptyContainer: {
            paddingVertical: 28,
            alignItems: 'center',
        },
        emptyText: {
            color: theme.colors.text_on_surface_text_medium_high,
            fontSize: 13,
        },
    });

export default BottomSheetProtocolView;
