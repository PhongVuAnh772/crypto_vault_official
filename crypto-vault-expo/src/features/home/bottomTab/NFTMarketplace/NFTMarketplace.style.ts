import { StyleSheet, Dimensions } from 'react-native';
import appColors from 'src/core/constants/AppColors';

const DeviceWidth = Dimensions.get('window').width;

const NFTMarketplaceStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: appColors.neutral.white, // White background as requested
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#121212', // Black text for white background
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        overflow: 'hidden',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7', // Light gray for search bar
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
    },
    searchInput: {
        flex: 1,
        color: '#121212',
        marginLeft: 10,
        fontSize: 16,
    },
    categoriesContainer: {
        paddingLeft: 20,
        marginBottom: 25,
    },
    categoryItem: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#F7F7F7',
    },
    categoryItemActive: {
        backgroundColor: '#7D40FF',
    },
    categoryText: {
        color: '#666',
        fontWeight: '600',
    },
    categoryTextActive: {
        color: appColors.neutral.white,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#121212',
    },
    viewAll: {
        color: '#999',
        fontSize: 14,
    },
    collectionList: {
        // Removed paddingHorizontal: 20 to avoid double padding for list header components
    },
    card: {
        width: DeviceWidth - 40,
        height: 400,
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: 20,
        marginHorizontal: 20,
        backgroundColor: appColors.neutral.white,
        position: 'relative',
        // Shadow for premium look on white background
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)', // Subtler overlay
    },
    cardContent: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
    },
    collectionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    collectionName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: appColors.neutral.white,
        marginRight: 5,
    },
    floorPrice: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    badgeContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        flexDirection: 'row',
    },
    itemCountBadge: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 30,
        marginRight: 10,
    },
    itemCountText: {
        color: appColors.neutral.white,
        fontSize: 14,
        fontWeight: '600',
    },
    networkBadge: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardActions: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityButton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginRight: 10,
    },
    collectionButton: {
        backgroundColor: appColors.neutral.white,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    activityButtonText: {
        color: appColors.neutral.white,
    },
    collectionButtonText: {
        color: '#000',
    },
    myCollectionEntry: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7', // Lighter entry
        padding: 15,
        borderRadius: 15,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    myCollectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#7D40FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    myCollectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#121212',
    },
    myCollectionSub: {
        fontSize: 12,
        color: '#666',
    },
});

export default NFTMarketplaceStyle;
