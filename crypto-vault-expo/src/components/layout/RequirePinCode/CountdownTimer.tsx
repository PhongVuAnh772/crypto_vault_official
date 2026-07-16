import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';

type CountdownTimerType = {
    remainingTime: number;
};

const CountdownTimer: React.FC<CountdownTimerType> = ({ remainingTime }) => {
    const minutes = Math.floor(remainingTime / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return (
        <View style={styles.container}>
            {/* Dark Metallic Mesh Background */}
            <LinearGradient
                colors={["#0F172A", "#1E293B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <LinearGradient
                        colors={["#EF444433", "#EF444400"]}
                        style={styles.iconGlow}
                    />
                    <Feather name="shield" size={120} color="#EF4444" />
                    <View style={styles.lockOverlay}>
                        <Feather name="lock" size={40} color="#EF4444" />
                    </View>
                </View>

                <AppText
                    title="Truy cập tạm thời bị khóa"
                    variant={TextVariantKeys.headlineMedium}
                    textColor="#FFFFFF"
                    styles={styles.title}
                />

                <AppText
                    title="Để bảo mật, ví của bạn đã được khóa tạm thời do nhập sai mã PIN quá nhiều lần. Vui lòng đợi trong giây lát."
                    variant={TextVariantKeys.bodyMMedium}
                    textColor="#94A3B8"
                    styles={styles.description}
                />

                <View style={styles.timerCard}>
                    <Text style={styles.timerTextLabel}>Mở khóa sau</Text>
                    <Text style={styles.timerText}>
                        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    iconContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    iconGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 100,
    },
    lockOverlay: {
        position: 'absolute',
        top: '55%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        fontWeight: '900',
        marginBottom: 16,
    },
    description: {
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    timerCard: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        paddingVertical: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    timerTextLabel: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    timerText: {
        fontSize: 48,
        fontWeight: '700',
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'],
    },
});

export default CountdownTimer;
