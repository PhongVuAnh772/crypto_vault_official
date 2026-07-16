import { StyleSheet } from 'react-native';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        transactionContainer: {
            borderRadius: 4,
        },
        firstTransactionItemInSection: {
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
        },
        lastTransactionItemInSection: {
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
        },
    });

export default useStyles;
