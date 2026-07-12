import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyle = (insets: EdgeInsets, theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        container: {
            backgroundColor: theme.colors.surface_surface_default,
            flex: 1,
        },
        headerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: theme.colors.surface_surface_default,
        },
        headerTitleContainer: {
            alignItems: 'center',
            flex: 1,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: '#0A0D14',
            fontFamily: mPlus1.bold,
        },
        headerSubtitle: {
            fontSize: 12,
            color: '#7C8099',
            marginTop: 2,
            fontFamily: mPlus1.medium,
        },
        backButton: {
            padding: 8,
            marginLeft: -8,
        },
        headerSpacer: {
            width: 40,
        },
        warningCard: {
            flexDirection: 'row',
            backgroundColor: '#F5F6FF', // Light purple background matching mockup
            borderRadius: 12,
            padding: 16,
            marginHorizontal: 20,
            marginTop: 15,
            alignItems: 'center',
        },
        warningText: {
            flex: 1,
            marginLeft: 12,
            fontSize: 13,
            color: '#5B63E4', // Indigo color matching mockup
            lineHeight: 18,
            fontFamily: mPlus1.medium,
        },
        inputWrapper: {
            marginHorizontal: 20,
            marginTop: 16,
        },
        labelRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
        },
        labelText: {
            fontSize: 14,
            fontWeight: '600',
            color: '#0A0D14',
            fontFamily: mPlus1.bold,
        },
        rightActionRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        pasteBtn: {
            marginRight: 15,
        },
        pasteText: {
            fontSize: 14,
            fontWeight: '600',
            color: '#5B63E4',
            fontFamily: mPlus1.bold,
        },
        scanBtn: {
            padding: 4,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F9FAFB', // Light gray background matching mockup
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 16,
            paddingHorizontal: 12,
            height: 56,
        },
        leftIconCircle: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#EEF2FF', // Light blue/purple circle matching mockup
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        leftIconText: {
            fontSize: 15,
            fontWeight: '700',
            color: '#5B63E4',
            fontFamily: mPlus1.bold,
        },
        textInput: {
            flex: 1,
            fontSize: 15,
            color: '#0A0D14',
            fontWeight: '500',
            fontFamily: mPlus1.medium,
            padding: 0,
            height: '100%',
        },
        helpCard: {
            flexDirection: 'row',
            backgroundColor: '#F5F6FF',
            borderRadius: 12,
            padding: 16,
            marginHorizontal: 20,
            marginTop: 20,
            alignItems: 'center',
        },
        helpTextContainer: {
            flex: 1,
            marginLeft: 12,
            marginRight: 8,
        },
        helpTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: '#0A0D14',
            fontFamily: mPlus1.bold,
        },
        helpSubtitle: {
            fontSize: 12,
            color: '#7C8099',
            marginTop: 4,
            lineHeight: 16,
            fontFamily: mPlus1.medium,
        },
        button: {
            backgroundColor: '#9E86FF', // Purple button matching mockup
            height: 52,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 20,
            marginVertical: 20,
        },
        buttonDisabled: {
            backgroundColor: '#E5E7EB', // Gray button when disabled matching mockup
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#FFFFFF',
            fontFamily: mPlus1.bold,
        },
        disable: {
            color: appColors.neutral.n500,
        },
    });

export default useStyle;
