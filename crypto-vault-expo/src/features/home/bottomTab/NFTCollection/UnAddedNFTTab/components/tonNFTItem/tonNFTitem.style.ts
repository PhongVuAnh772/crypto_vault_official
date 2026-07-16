import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const styles = StyleSheet.create({
    ...appStyles,
    container: {
        paddingHorizontal: 10,
    },
    itemContainer: {
        flex: 1,
        margin: 5,
        backgroundColor: '#f0f0f0',
        padding: 10,
        alignItems: 'center',
    },
    headerStyle: {
        width: '70%',
        textAlign: 'center',
        ...appStyles.center,
    },
    addedNFTTag: {
        position: 'absolute',

        paddingHorizontal: 7,
        paddingVertical: 4,
        backgroundColor: appColors.light.green,
        alignSelf: 'flex-start',
        top: 4,
        right: 7,
    },

    pV2: {
        paddingVertical: 5,
    },
    pH6: {
        paddingHorizontal: 10,
        borderRadius: 4,
    },

    verifiedContainer: {
        backgroundColor: appColors.light.green,
    },
    unVerifiedContainer: {
        backgroundColor: appColors.functional.disable,
    },
    unVerifiedNFTContainer: {
        alignSelf: 'flex-start',
        backgroundColor: appColors.neutral.n500,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    mbt2: {
        marginBottom: 2,
    },
    mt2: {
        marginTop: 2,
    },
    verifiedNFTContainer: {
        backgroundColor: appColors.functional.green,
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    mt4: {
        marginTop: 4,
    },
    mbt4: {
        marginBottom: 4,
    },
    spamContainer: {
        backgroundColor: appColors.main.tokyoRed,
        position: 'absolute',
        top: 4,
    },
    logoCollectionTextLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    protocolNFTViewContainer: {
        flexShrink: 1,
        width: '65%',
    },
    addedContainer: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        flexDirection: 'row',
        ...appStyles.center,
    },
    added: { backgroundColor: appColors.main.tokyoRed },
    unAdded: { backgroundColor: appColors.neutral.black },
    nftItem: {
        backgroundColor: appColors.neutral.white,
        paddingLeft: 5,
        paddingHorizontal: 8,
    },

    containerLoading: {
        backgroundColor: appColors.neutral.white,
    },
    seperateTop: {
        paddingBottom: 2,
    },
    seperateBottom: {
        paddingTop: 2,
    },
    logoCollection: {
        width: 64,
        height: 64,
        borderRadius: 4,
        alignSelf: 'center',
        borderWidth: 0.4,
        borderColor: appColors.neutral.n300,
    },
    left: {
        width: '70%',
    },
    right: {
        width: '30%',
        alignItems: 'flex-end',
    },
    addedBorder: {
        borderWidth: 0.5,
        borderColor: appColors.neutral.white,
    },
});

export default styles;
