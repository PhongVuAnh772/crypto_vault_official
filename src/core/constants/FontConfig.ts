import { configureFonts } from 'react-native-paper';
import { Inter } from './FontFamily';

const baseVariants = configureFonts();
export const customVariants = {
    headlineExtraLarge: {
        ...baseVariants.headlineLarge,
        fontFamily: Inter.bold,
        fontWeight: '600',
        fontSize: 36,
        lineHeight: 44,
    },
    headlineLarge: {
        ...baseVariants.headlineLarge,
        fontFamily: Inter.bold,
        fontWeight: '600',
        fontSize: 32,
        lineHeight: 40,
    },
    headlineMedium: {
        ...baseVariants.headlineMedium,
        fontFamily: Inter.bold,
        fontWeight: '600',
        fontSize: 28,
        lineHeight: 36,
    },
    headlineSmall: {
        ...baseVariants.headlineSmall,
        fontFamily: Inter.bold,
        fontWeight: '500',
        fontSize: 24,
        lineHeight: 32,
    },
    titleLarge: {
        ...baseVariants.titleLarge,
        fontFamily: Inter.bold,
        fontWeight: '600',
        fontSize: 20,
        lineHeight: 26,
    },
    titleMedium: {
        ...baseVariants.titleMedium,
        fontFamily: Inter.bold,
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 24,
    },
    titleSmall: {
        ...baseVariants.titleSmall,
        fontFamily: Inter.bold,
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 20,
    },
    bodyMLarge: {
        ...baseVariants.bodyLarge,
        fontFamily: Inter.medium,
        fontWeight: '500',
        fontSize: 14,
        lineHeight: 24,
    },
    bodyMMedium: {
        ...baseVariants.bodyMedium,
        fontFamily: Inter.medium,
        fontWeight: '500',
        fontSize: 14,
        lineHeight: 20,
    },
    bodyMSmall: {
        ...baseVariants.bodySmall,
        fontFamily: Inter.medium,
        fontWeight: '500',
        fontSize: 12,
        lineHeight: 16,
    },
    bodyMTiny: {
        ...baseVariants.bodySmall,
        fontFamily: Inter.medium,
        fontWeight: '500',
        fontSize: 10,
        lineHeight: 16,
    },
    bodyRLarge: {
        ...baseVariants.bodyLarge,
        fontFamily: Inter.regular,
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
    },
    bodyRMedium: {
        ...baseVariants.bodyMedium,
        fontFamily: Inter.regular,
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20,
    },
    bodyRSmall: {
        ...baseVariants.bodySmall,
        fontFamily: Inter.regular,
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 16,
    },
    bodyRTiny: {
        ...baseVariants.bodySmall,
        fontFamily: Inter.regular,
        fontWeight: '400',
        fontSize: 10,
        lineHeight: 16,
    },
    labelLarge: {
        ...baseVariants.labelLarge,
        fontFamily: Inter.bold,
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 20,
    },
    labelMedium: {
        ...baseVariants.labelMedium,
        fontFamily: Inter.bold,
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 20,
    },
    labelSmall: {
        ...baseVariants.labelSmall,
        fontFamily: Inter.bold,
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
    },
    labelTiny: {
        ...baseVariants.labelSmall,
        fontFamily: Inter.bold,
        fontWeight: '600',
        fontSize: 10,
        lineHeight: 16,
    },
    labelLink: {
        ...baseVariants.labelSmall,
        fontFamily: Inter.bold,
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 20,
    },
    labelCap: {
        ...baseVariants.labelSmall,
        fontFamily: Inter.medium,
        fontWeight: '500',
        fontSize: 12,
        lineHeight: 16,
    },
} as const;

const fontsConfigure = configureFonts({
    config: {
        ...baseVariants,
        ...customVariants,
    },
});

export default fontsConfigure;
