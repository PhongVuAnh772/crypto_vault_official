import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        container: {
            ...appStyles.flex1,
            backgroundColor: 'white', // Very light gray background matching mockup
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: 'white',
        },
        closeBtn: {
            padding: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerTitleWrapper: {
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
        historyBtn: {
            padding: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        searchBarWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F4F6F9', // light gray rounded input field
            borderRadius: 24,
            paddingHorizontal: 16,
            height: 48,
            marginHorizontal: 20,
            marginTop: 8,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
        },
        searchInput: {
            flex: 1,
            marginLeft: 10,
            fontSize: 14,
            color: '#0A0D14',
            fontFamily: mPlus1.medium,
            padding: 0,
            height: '100%',
        },
        clearSearchBtn: {
            padding: 4,
        },
        listWrapper: {
            flex: 1,
        },
        item: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 16,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '#F3F4F6',
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            marginHorizontal: 20,
            marginBottom: 8,
        },
        image: {
            width: 32,
            height: 32,
            borderRadius: 16,
        },
        switch: {
            transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
        },
        buttonContainer: {
            paddingHorizontal: 20,
            paddingBottom: 24,
            paddingTop: 12,
            backgroundColor: 'white',
        },
        button: {
            backgroundColor: '#3B82F6', // Blue brand button matching mockup
            height: 52,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
        },
        buttonText: {
            fontSize: 15,
            fontWeight: '600',
            color: '#FFFFFF',
            fontFamily: mPlus1.bold,
        },
    });

export default useStyles;
