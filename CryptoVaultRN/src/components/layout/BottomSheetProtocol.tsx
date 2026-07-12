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
import AppText from 'src/components/common/AppText';
import ProtocolItem from 'src/components/homeComponents/ProtocolItem';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    const insets = useSafeAreaInsets();
    const styles = useStyle(theme);

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
            {/* Top Sheet Handle */}
            <View style={styles.handleBar} />

            {/* Header section with centered Title & Subtitle */}
            <View style={styles.headerContainer}>
                <AppText
                    title="Chọn giao thức"
                    variant={TextVariantKeys.titleLarge}
                    styles={styles.headerTitle}
                    textColor="#1A1C36"
                />
                <AppText
                    title="Chọn mạng blockchain bạn muốn sử dụng"
                    variant={TextVariantKeys.bodyMSmall}
                    styles={styles.headerSubtitle}
                    textColor="#7D859A"
                />
            </View>

            {/* Close Button in a circle */}
            <TouchableOpacity
                activeOpacity={0.7}
                style={styles.closeIconCircle}
                onPress={onCloseModalProtocol}
            >
                <Feather name="x" size={16} color="#7D859A" />
            </TouchableOpacity>

            {/* Protocol FlatList (no bordered box container, directly rendered cards) */}
            <FlatList
                data={protocolDataLists}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item, index) =>
                    item?._id ? String(item._id) : `protocol-${index}`
                }
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
                            tintColor="#6A56FD"
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
            />

            {/* Warning Info Banner at the bottom */}
            <View style={styles.warningBanner}>
                {/* Shield Icon container with glow circle */}
                <View style={styles.shieldGlowCircle}>
                    <Feather name="shield" size={20} color="#6A56FD" />
                    <View style={styles.shieldCheckDot}>
                        <Feather name="check" size={8} color="#FFFFFF" />
                    </View>
                </View>
                <View style={styles.warningTextContainer}>
                    <Text style={styles.warningTitle}>Chọn đúng mạng lưới</Text>
                    <Text style={styles.warningSubtitle}>
                        Đảm bảo bạn chọn đúng mạng lưới để tránh mất tài sản khi giao dịch.
                    </Text>
                </View>
            </View>
        </View>
    );
};

const useStyle = (theme: AppThemeType) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 20,
            flex: 1,
            backgroundColor: '#F8F9FC', // Clean mockup background
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
        handleBar: {
            width: 44,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#DCDFEA',
            alignSelf: 'center',
            marginTop: 10,
            marginBottom: 20,
        },
        headerContainer: {
            alignItems: 'center',
            marginBottom: 20,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '700',
            fontFamily: theme.fonts.titleLarge.fontFamily,
            color: '#1A1C36',
            marginBottom: 4,
        },
        headerSubtitle: {
            fontSize: 13,
            color: '#7D859A',
            textAlign: 'center',
        },
        closeIconCircle: {
            position: 'absolute',
            right: 20,
            top: 20,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#EAEBF0', // Light gray background circle
            justifyContent: 'center',
            alignItems: 'center',
        },
        listContent: {
            paddingBottom: 16,
        },
        emptyContainer: {
            paddingVertical: 28,
            alignItems: 'center',
        },
        emptyText: {
            color: theme.colors.text_on_surface_text_medium_high,
            fontSize: 13,
        },
        warningBanner: {
            flexDirection: 'row',
            backgroundColor: '#F4F3FF', // Soft violet banner background
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            marginTop: 10,
        },
        shieldGlowCircle: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#E9E7FF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        shieldCheckDot: {
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#6A56FD',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E9E7FF',
        },
        warningTextContainer: {
            flex: 1,
        },
        warningTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: '#1A1C36',
            marginBottom: 2,
        },
        warningSubtitle: {
            fontSize: 12,
            color: '#7D859A',
            lineHeight: 16,
        },
    });

export default BottomSheetProtocolView;
