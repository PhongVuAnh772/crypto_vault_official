import { StyleSheet, Dimensions } from 'react-native';
import appColors from 'src/core/constants/AppColors';

const { width } = Dimensions.get('window');

const NFTCollectionDetailStyle = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    headerImages: { height: 280, width: '100%', position: 'relative' },
    headerGrid: { flexDirection: 'row', height: '100%' },
    gridImage: { flex: 1, height: '100%', marginHorizontal: 1 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
    backBtn: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    moreBtn: { position: 'absolute', top: 50, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    contentCard: { flex: 1, backgroundColor: '#121212', borderTopLeftRadius: 35, borderTopRightRadius: 35, marginTop: -35, paddingHorizontal: 20 },
    logoContainer: { alignSelf: 'center', marginTop: -40, width: 84, height: 84, borderRadius: 42, backgroundColor: '#121212', padding: 4 },
    logo: { width: '100%', height: '100%', borderRadius: 40, backgroundColor: '#fff' },
    titleSection: { alignItems: 'center', marginTop: 15 },
    nameRow: { flexDirection: 'row', alignItems: 'center' },
    name: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginRight: 8 },
    desc: { fontSize: 15, color: '#999', textAlign: 'center', marginTop: 10, lineHeight: 22, paddingHorizontal: 20 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
    statCard: { flex: 1, backgroundColor: '#1E1E1E', borderRadius: 20, padding: 15, marginHorizontal: 5, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    statLabel: { fontSize: 13, color: '#999', marginBottom: 5 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    listContainer: { paddingVertical: 25 },
    nftCard: { width: (width - 50) / 2, marginBottom: 15, borderRadius: 25, overflow: 'hidden', backgroundColor: '#1E1E1E' },
    nftImage: { width: '100%', height: 200 },
    addBtn: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
    nftFooter: { position: 'absolute', bottom: 10, left: 10, right: 10, borderRadius: 15, overflow: 'hidden' },
    nftBlur: { padding: 8, flexDirection: 'row', justifyContent: 'space-between' },
    nftLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
    nftValue: { fontSize: 12, fontWeight: 'bold', color: '#fff' }
});

export default NFTCollectionDetailStyle;
