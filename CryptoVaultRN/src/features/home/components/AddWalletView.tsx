import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { appImages } from 'src/core/constants/AppImages';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AddWalletViewType = {
    onClose: () => void;
    onCreate: () => void;
    onRestore: () => void;
    typeWallet?: boolean;
};

const AddWalletView: React.FC<AddWalletViewType> = ({
    onClose,
    onCreate,
    onRestore,
    typeWallet,
}) => {
    const theme: AppThemeType = useAppTheme();
    const insets = useSafeAreaInsets();
    const styles = useStyles(theme);

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
            {/* Top Sheet Handle */}
            <View style={styles.handleBar} />

            {/* Close Button in a circle */}
            <TouchableOpacity
                activeOpacity={0.7}
                style={styles.closeIconCircle}
                onPress={onClose}
            >
                <Feather name="x" size={16} color="#7D859A" />
            </TouchableOpacity>

            {/* 3D Wallet Illustration */}
            <Image
                source={appImages.walletIllustration}
                style={styles.illustrationImage}
                resizeMode="contain"
            />

            {/* Header section with centered Title & Subtitle */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Kết nối tài khoản</Text>
                <Text style={styles.headerSubtitle}>
                    Chọn cách kết nối để quản lý tài sản của bạn
                </Text>
            </View>

            {/* Option 1: Tạo tài khoản mới */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onCreate}
                style={[styles.card, styles.createCard]}
            >
                <View style={styles.cardContent}>
                    <View style={[styles.iconCircle, styles.createIconCircle]}>
                        <Feather name="plus" size={20} color="#6A56FD" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.cardTitle}>Tạo tài khoản mới</Text>
                        <Text style={styles.cardSubtitle}>Cụm từ bí mật</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#6A56FD" />
                </View>
            </TouchableOpacity>

            {/* Option 2: Thêm tài khoản hiện có */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onRestore}
                style={[styles.card, styles.restoreCard]}
            >
                <View style={styles.cardContent}>
                    <View style={[styles.iconCircle, styles.restoreIconCircle]}>
                        <Feather name="download" size={18} color="#D53F8C" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.cardTitle}>Thêm tài khoản hiện có</Text>
                        <Text style={styles.cardSubtitle}>Nhập hoặc khôi phục</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#D53F8C" />
                </View>
            </TouchableOpacity>

            {/* Security Alert Banner at the bottom */}
            <View style={styles.securityBanner}>
                {/* Shield Icon container with glow circle */}
                <View style={styles.shieldGlowCircle}>
                    <Feather name="shield" size={20} color="#6A56FD" />
                    <View style={styles.shieldCheckDot}>
                        <Feather name="check" size={8} color="#FFFFFF" />
                    </View>
                </View>
                <View style={styles.securityTextContainer}>
                    <Text style={styles.securityTitle}>Bảo mật là ưu tiên hàng đầu</Text>
                    <Text style={styles.securitySubtitle}>
                        Thông tin của bạn được mã hóa và bảo vệ an toàn tuyệt đối.
                    </Text>
                </View>
            </View>
        </View>
    );
};

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 20,
            backgroundColor: '#F8F9FC', // Clean mockup background color
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            width: '100%',
        },
        handleBar: {
            width: 44,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#DCDFEA',
            alignSelf: 'center',
            marginTop: 10,
            marginBottom: 10,
        },
        closeIconCircle: {
            position: 'absolute',
            right: 20,
            top: 20,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#EAEBF0', // Light gray background circle matching mockup
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
        },
        illustrationImage: {
            width: 120,
            height: 120,
            alignSelf: 'center',
            marginTop: 20,
            marginBottom: 10,
        },
        headerContainer: {
            alignItems: 'center',
            marginBottom: 20,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: '#1A1C36',
            marginBottom: 4,
        },
        headerSubtitle: {
            fontSize: 13,
            color: '#7D859A',
            textAlign: 'center',
        },
        card: {
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            backgroundColor: '#FFFFFF',
        },
        createCard: {
            borderColor: '#E9E8FF',
        },
        restoreCard: {
            borderColor: '#F0F1F5',
        },
        cardContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        iconCircle: {
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 14,
        },
        createIconCircle: {
            backgroundColor: '#EEECFF',
        },
        restoreIconCircle: {
            backgroundColor: '#FEEFFA',
        },
        textContainer: {
            flex: 1,
        },
        cardTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: '#1A1C36',
            marginBottom: 2,
        },
        cardSubtitle: {
            fontSize: 12,
            color: '#7D859A',
        },
        securityBanner: {
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
        securityTextContainer: {
            flex: 1,
        },
        securityTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: '#1A1C36',
            marginBottom: 2,
        },
        securitySubtitle: {
            fontSize: 12,
            color: '#7D859A',
            lineHeight: 16,
        },
    });

export default AddWalletView;
