/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import AppText from 'src/components/common/AppText';
import { SearchSvgIcon, PulseSvgIcon, ArrowSvgIcon, ArrowDownSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';

const { width } = Dimensions.get('window');

const WidgetCard = ({ title, value, footer, children }: { title: string, value: string, footer?: any, children?: any }) => (
    <View style={styles.widgetCard}>
        <AppText title={title} variant={TextVariantKeys.bodyRTiny} textColor="#999999" />
        <AppText title={value} variant={TextVariantKeys.titleMedium} textColor="#000000" styles={{ fontWeight: '700', marginTop: 4 }} />
        {footer}
        <View style={{ marginTop: 'auto' }}>
            {children}
        </View>
    </View>
);

const RevolutWidgets = () => {
    return (
        <View style={styles.widgetsSection}>
            <AppText title="Widgets" variant={TextVariantKeys.titleMedium} textColor="#000000" styles={{ fontWeight: '700', marginBottom: 16 }} />
            <View style={styles.widgetGrid}>
                <WidgetCard title="Spend this month" value="€ 128.02" footer={<AppText title="▲ €5" variant={TextVariantKeys.labelTiny} textColor="#FF4C8B" styles={{ fontWeight: '600' }} />}>
                     <View style={styles.chartSim} />
                </WidgetCard>
                <WidgetCard title="Total wealth" value="€ 139" footer={<AppText title="▲ €5" variant={TextVariantKeys.labelTiny} textColor="#007AFF" styles={{ fontWeight: '600' }} />}>
                     <View style={appStyles.flexRow}>
                        <View style={[styles.bubble, { backgroundColor: '#007AFF' }]} />
                        <View style={[styles.bubble, { backgroundColor: '#8E8E93', marginLeft: -8 }]} />
                        <View style={[styles.bubble, { backgroundColor: '#00D084', marginLeft: -8 }]} />
                     </View>
                </WidgetCard>
            </View>
            <View style={[styles.widgetGrid, { marginTop: 12 }]}>
                <WidgetCard title="Disposable" value="" >
                    <View style={styles.cardWidgetImg} />
                    <View style={styles.eyeBtn}>
                        <SearchSvgIcon color="#007AFF" width={14} height={14} />
                    </View>
                </WidgetCard>
                <WidgetCard title="Dylan E." value="" >
                    <View style={styles.profileWidgetArea}>
                        <View style={styles.pfpSmall} />
                        <View style={styles.actionButtons}>
                            <View style={styles.pBtn}><ArrowSvgIcon color="#007AFF" width={12} height={12} /></View>
                            <View style={styles.pBtn}><ArrowDownSvgIcon color="#007AFF" width={12} height={12} /></View>
                        </View>
                    </View>
                </WidgetCard>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    widgetsSection: {
        marginTop: 35,
        paddingHorizontal: 24,
    },
    widgetGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    widgetCard: {
        width: (width - 60) / 2,
        height: 160,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    chartSim: {
        height: 40,
        backgroundColor: '#F0F4FF',
        borderRadius: 10,
        width: '100%',
    },
    bubble: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    cardWidgetImg: {
        width: '100%',
        height: 50,
        backgroundColor: '#1C1C1E',
        borderRadius: 6,
    },
    eyeBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F7FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileWidgetArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    pfpSmall: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E0E0E0',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    pBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F0F7FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default RevolutWidgets;
