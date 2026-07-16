import { Platform, StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';

const useStyles = (
    BOTTOM_SHEET_MAX_HEIGHT: number,
    BOTTOM_SHEET_MIN_HEIGHT: number,
    insets: EdgeInsets,
    theme: AppThemeType,
) =>
    StyleSheet.create({
        modalContainer: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            flex: 1,
            justifyContent: 'flex-end',
        },
        bottomSheet: {
            position: 'absolute',
            width: '100%',
            height: BOTTOM_SHEET_MAX_HEIGHT,
            bottom: BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT,
            ...Platform.select({
                android: {elevation: 3},
                ios: {
                    shadowColor: '#a8bed2',
                    shadowOpacity: 1,
                    shadowRadius: 6,
                    shadowOffset: {
                        width: 2,
                        height: 2,
                    },
                },
            }),
            backgroundColor: theme.colors.surface_surface_high,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            justifyContent: 'space-between',
            paddingBottom: 30,
        },
        draggableArea: {
            width: 132,
            height: 32,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
        },
        dragHandle: {
            width: 100,
            height: 6,
            backgroundColor: '#d3d3d3',
            borderRadius: 10,
        },
        subModalContainer: {
            position: 'absolute',
            flex: 1,
            width: Utils.screenWidth,
            height: Utils.screenHeight,
        },
        bottomButton: {
            position: 'absolute',
            ...appStyles.fullWidth,
            justifyContent: 'flex-end',
            bottom: 32 + insets.bottom,
            zIndex: 2,
        },
        bottomButtonScroll: {
            position: 'absolute',
            ...appStyles.fullWidth,
            bottom: insets.bottom,
            paddingHorizontal: 25,
        },
        mainView: {
            height: '100%',
        },
        childrenView: {
            ...appStyles.fullWidth,
            position: 'absolute',
            paddingTop: 32,
            height: '100%',
            zIndex: 1,
        },
        childrenViewScroll: {
            ...appStyles.fullWidth,
            position: 'absolute',
            backgroundColor: theme.colors.surface_surface_default,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: BOTTOM_SHEET_MAX_HEIGHT,
        },
        contentContainerStyle: {
            paddingBottom: insets.bottom * 2 + (Utils.isAndroid ? 80 : 40),
        },
    });

export default useStyles;
