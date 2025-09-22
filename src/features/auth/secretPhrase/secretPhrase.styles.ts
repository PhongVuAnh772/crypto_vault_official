import { StyleSheet } from 'react-native';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        button: {
            backgroundColor: theme.colors.surface_surface_brand,
            width: '100%',
        },
        secretPhraseItem: {
            padding: 5,
            ...appStyles.flex1,
            ...appStyles.flexRow,
        },
        newSecretPhraseItem: {
            padding: 5,
            ...appStyles.flex1,
            ...appStyles.flexRow,
            position: 'absolute',
            zIndex: 2,
        },
        secretPhraseItemViewIndex: {
            ...appStyles.center,
            height: 40,
            width: GlobalUtils.getEnableRedXNewTheme() ? 26 : 22,
            backgroundColor: GlobalUtils.getEnableRedXNewTheme()
                ? undefined
                : theme.colors.surface_surface_high,
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
            marginRight: 2,
        },

        secretPhraseItemViewPhrase: {
            ...appStyles.center,
            height: 40,
            width: 85,
            paddingRight: 5,
        },
        secretPhraseItemViewPhrase2: {
            ...appStyles.justifyContentCenter,
            paddingLeft: GlobalUtils.getEnableRedXNewTheme() ? 0 : 8,
            height: 40,
            width: '100%',
            backgroundColor: GlobalUtils.getEnableRedXNewTheme()
                ? undefined
                : theme.colors.surface_surface_high,
            borderBottomRightRadius: 4,
            borderTopRightRadius: 4,
        },

        newThemeOpacity: {
            ...StyleSheet.absoluteFillObject,
            opacity: 0.7,
        },
        switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
    });
export default useStyles;
