import { launchImageLibrary } from 'react-native-image-picker';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTonAddressData } from 'src/core/redux/slice/account.selector';
import { useSelector } from 'react-redux';
import { getIsTestnet } from 'src/core/redux/slice/app.selector';
import EnvConfig from 'src/core/constants/EnvConfig';
import { nftService } from './services/nftService';
import { tonConnectMarketplaceService } from './services/tonConnectService';
import { uploadService } from './services/uploadService';

const CreateNFTScreen: React.FC = () => {
  const tonWallet = useTonAddressData();
  const isTestnet = useSelector(getIsTestnet);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attributesText, setAttributesText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const collectionAddress = isTestnet
    ? (process.env.NFT_COLLECTION_ADDRESS_TESTNET || EnvConfig.NFT_COLLECTION_ADDRESS_TESTNET || EnvConfig.NFT_COLLECTION_ADDRESS)
    : (process.env.NFT_COLLECTION_ADDRESS || EnvConfig.NFT_COLLECTION_ADDRESS);

  const parsedAttributes = useMemo(() => {
    if (!attributesText.trim()) return [];
    return attributesText
      .split(',')
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const [k, v] = pair.split(':').map((it) => it.trim());
        return { trait_type: k || 'attr', value: v || '' };
      });
  }, [attributesText]);

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      includeBase64: true,
      quality: 0.9,
    });
    const asset = result.assets?.[0];
    if (!asset?.uri || !asset.base64) return;
    setImageUri(asset.uri);
    setImageBase64(asset.base64);
  };

  const createNft = async () => {
    if (!tonWallet?.address) return Alert.alert('Lỗi', 'Không có ví TON');
    if (!imageBase64 || !imageUri) return Alert.alert('Lỗi', 'Chưa chọn ảnh');
    if (!name.trim()) return Alert.alert('Lỗi', 'Thiếu tên NFT');
    if (!collectionAddress) return Alert.alert('Cấu hình thiếu', 'Thiếu NFT_COLLECTION_ADDRESS');

    try {
      setLoading(true);
      const upload = await uploadService.uploadNftImage({
        fileName: `${Date.now()}.png`,
        contentType: 'image/png',
        base64Data: imageBase64,
      });

      const metadata = await nftService.createMetadata({
        name: name.trim(),
        description: description.trim(),
        image_url: upload.image_url,
        attributes: parsedAttributes,
      });

      const pendingNft = await nftService.createNftRecord({
        owner_address: tonWallet.address,
        name: name.trim(),
        description: description.trim(),
        image_url: upload.image_url,
        metadata_url: metadata.metadata_url,
        attributes: parsedAttributes,
        status: 'pending',
      });

      const txResult = await tonConnectMarketplaceService.mintNft({
        collectionAddress,
        ownerAddress: tonWallet.address,
        metadataUrl: metadata.metadata_url,
        itemIndex: Date.now(),
      });

      await nftService.patchNft(pendingNft.id, {
        tx_hash: typeof txResult === 'string' ? txResult : (txResult as any)?.txHash || null,
        status: 'pending',
      });
      Alert.alert('Đã gửi giao dịch mint', 'NFT record đã được tạo ở trạng thái pending');
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Create NFT thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 18 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create NFT</Text>
        <Text style={styles.subTitle}>{isTestnet ? 'TON Testnet' : 'TON Mainnet'}</Text>

        <TouchableOpacity style={styles.upload} onPress={pickImage} activeOpacity={0.9}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <View style={styles.emptyPreview}>
              <Text style={styles.emptyText}>Tap để chọn ảnh NFT</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formCard}>
          <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#6B7280" style={styles.input} />
          <TextInput value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="#6B7280" style={styles.input} multiline />
          <TextInput value={attributesText} onChangeText={setAttributesText} placeholder="attributes: rarity:rare,color:blue" placeholderTextColor="#6B7280" style={styles.input} />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={createNft} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Mint NFT</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1220' },
  container: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#F9FAFB', marginTop: 10 },
  subTitle: { color: '#93C5FD', marginBottom: 12 },
  upload: { borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, overflow: 'hidden', marginBottom: 12, backgroundColor: '#111827' },
  preview: { width: '100%', height: 230 },
  emptyPreview: { height: 230, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontWeight: '600' },
  formCard: { borderRadius: 12, borderWidth: 1, borderColor: '#1F2937', padding: 12, backgroundColor: '#111827' },
  input: { borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 12, marginBottom: 10, color: '#F9FAFB', backgroundColor: '#0F172A' },
  footer: { marginTop: 8 },
  button: { backgroundColor: '#2563EB', borderRadius: 10, padding: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default CreateNFTScreen;
