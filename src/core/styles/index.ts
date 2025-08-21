import { StyleSheet } from 'react-native';
import appColors from '../constants/AppColors';
import flex from './flex';
import spacing from './spacing';
import text from './text';

export { default as flex } from './flex';
export { default as spacing } from './spacing';
export { default as text } from './text';
const appStyles = StyleSheet.create({
    ...flex,
    ...spacing,
    ...text,
    hide: {
        opacity: 0,
    },
    iconCircleSize16: {
        width: 16,
        height: 16,
        borderRadius: 100,
    },

    iconCircleSize24: {
        width: 24,
        height: 24,
        borderRadius: 100,
    },
    iconCircleSize18: {
        width: 18,
        height: 18,
        borderRadius: 100,
    },
    iconCircleSize28: {
        width: 28,
        height: 28,
        borderRadius: 100,
    },
    iconCircleSize32: {
        width: 32,
        height: 32,
        borderRadius: 100,
    },
    iconCircleSize50: {
        width: 50,
        height: 50,
        borderRadius: 100,
    },
    iconCircleSize100: {
        width: 100,
        height: 100,
        borderRadius: 100,
    },
    iconCircleSize13: {
        width: 13,
        height: 13,
        borderRadius: 100,
    },
    iconCircleSize11: {
        width: 11,
        height: 11,
        borderRadius: 100,
    },
    overflowHidden: {
        overflow: 'hidden',
    },
    backgroundBlack: {
        backgroundColor: appColors.neutral.black,
    },
    backgroundWhite: {
        backgroundColor: appColors.neutral.white,
    },
    backgroundTransparent: {
        backgroundColor: 'transparent',
    },
    line: { height: 0.5, backgroundColor: appColors.neutral.n200 },
    z999: {
        zIndex: 999,
    },
    h100: {
        height: '100%',
    },
    opacity5: {
        opacity: 0.5,
    },
    positionAbsolute: {
        position: 'absolute',
    },
    positionRelative: {
        position: 'relative',
    },
    bor4: {
        borderRadius: 4,
    },
});

export default appStyles;
