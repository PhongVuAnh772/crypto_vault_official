import { StyleSheet, Dimensions } from 'react-native';
import appColors from 'src/core/constants/AppColors';

const { width, height } = Dimensions.get('window');

const AIDetailStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundImage: {
        width: width,
        height: height,
        position: 'absolute',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    socialActions: {
        position: 'absolute',
        bottom: 270,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    likeBadge: {
        backgroundColor: '#FF4D6D',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 25,
        marginRight: 10,
    },
    likeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    socialIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    infoCard: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        height: 220,
        borderRadius: 35,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    blurContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    label: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        marginBottom: 4,
    },
    value: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    creatorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    creatorName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    creatorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    donateButton: {
        flex: 1,
        height: 56,
        backgroundColor: '#fff',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    donateText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    downloadButton: {
        flex: 1,
        height: 56,
        backgroundColor: '#2D6BFF',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AIDetailStyle;
