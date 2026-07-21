import React from 'react';
import { RefreshControl, ScrollView, View, Image, Text, StyleSheet } from 'react-native';
import AppText from 'src/components/common/AppText';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';
import { Feather } from '@expo/vector-icons';

export type EmptyCollectionProps = {
    refreshing?: boolean;
    onRefresh?: () => void;
};

const EmptyCollection: React.FC<EmptyCollectionProps> = ({
    refreshing,
    onRefresh,
}) => {
    return (
        <ScrollView
            style={appStyles.flex1}
            refreshControl={
                refreshing && onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                ) : undefined
            }>
            <View style={localStyles.emptyCardFrame}>
                {/* 3D Box Illustration */}
                <Image
                    source={appImages.nftIllustration}
                    style={localStyles.illustrationImage}
                    resizeMode="contain"
                />

                {/* Texts */}
                <AppText
                    title="Chưa có NFT nào"
                    variant={TextVariantKeys.titleLarge}
                    textColor="#FFFFFF"
                    styles={localStyles.emptyTitle}
                />
                <AppText
                    title={"Bạn chưa sở hữu NFT nào.\nCác NFT bạn sở hữu trên ví này\nsẽ được hiển thị tại đây."}
                    variant={TextVariantKeys.bodyRMedium}
                    textColor="#B3C2D8"
                    styles={localStyles.emptySubtitle}
                />

                {/* Security alert banner inside card */}
                <View style={localStyles.securityBanner}>
                    <View style={localStyles.shieldIconBg}>
                        <Feather name="shield" size={16} color="#9E86FF" />
                        <View style={localStyles.shieldCheck}>
                            <Feather name="check" size={7} color="#07051A" />
                        </View>
                    </View>
                    <View style={localStyles.securityTextCol}>
                        <Text style={localStyles.securityTitle}>NFT của bạn được bảo vệ an toàn</Text>
                        <Text style={localStyles.securitySubtitle}>Chỉ bạn mới có quyền truy cập và quản lý.</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const localStyles = StyleSheet.create({
    emptyCardFrame: {
        paddingHorizontal: 16,
        marginTop: 20,
        alignItems: 'center',
    },
    illustrationImage: {
        width: 180,
        height: 180,
        marginTop: 10,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#B3C2D8',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    securityBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(158, 134, 255, 0.08)',
        borderRadius: 16,
        padding: 16,
        width: '100%',
    },
    shieldIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(158, 134, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    shieldCheck: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#9E86FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    securityTextCol: {
        flex: 1,
    },
    securityTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#9E86FF',
        marginBottom: 2,
    },
    securitySubtitle: {
        fontSize: 11,
        color: '#B3C2D8',
    },
});

export default EmptyCollection;
