import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { launchImageLibrary } from "react-native-image-picker";
import { useTonAddressData } from "src/core/redux/slice/account.selector";
import { useSelector } from "react-redux";
import { getIsTestnet } from "src/core/redux/slice/app.selector";
import EnvConfig from "src/core/constants/EnvConfig";
import { marketplaceSession } from "src/features/marketplace/services/apiClient";
import { nftService } from "src/features/marketplace/services/nftService";
import { tonConnectMarketplaceService } from "src/features/marketplace/services/tonConnectService";
import { uploadService } from "src/features/marketplace/services/uploadService";

export default function MintNftScreen() {
  const tonAddressData = useTonAddressData();
  const isTestnet = useSelector(getIsTestnet);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [attributes, setAttributes] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const collectionAddress = isTestnet
    ? (process.env.NFT_COLLECTION_ADDRESS_TESTNET || EnvConfig.NFT_COLLECTION_ADDRESS_TESTNET || EnvConfig.NFT_COLLECTION_ADDRESS)
    : (process.env.NFT_COLLECTION_ADDRESS || EnvConfig.NFT_COLLECTION_ADDRESS);

  /* ===============================
     PICK IMAGE
  =============================== */

  const pickImage = async () => {
    const res = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.9,
      selectionLimit: 1,
      includeBase64: true,
    });

    if (res.assets?.length) {
      setImageUri(res.assets[0].uri || null);
      setImageBase64(res.assets[0].base64 || null);
    }
  };

  /* ===============================
     MINT
  =============================== */

  const mint = async () => {
    if (!imageUri || !name || !tonAddressData) {
      Alert.alert("Thiếu dữ liệu");
      return;
    }
    if (!imageBase64) {
      Alert.alert("Thiếu dữ liệu", "Ảnh chưa có base64");
      return;
    }
    if (!collectionAddress) {
      Alert.alert("Cấu hình thiếu", "Thiếu NFT_COLLECTION_ADDRESS");
      return;
    }

    try {
      setLoading(true);
      await marketplaceSession.clear();
      const login = await nftService.walletLogin(tonAddressData.address);
      await marketplaceSession.setToken(login.token);

      const image = await uploadService.uploadNftImage({
        fileName: `${Date.now()}.png`,
        contentType: "image/png",
        base64Data: imageBase64,
      });
      const parsedAttributes = attributes
        .split(",")
        .map((it) => it.trim())
        .filter(Boolean)
        .map((it) => {
          const [k, v] = it.split(":").map((x) => x.trim());
          return { trait_type: k || "attr", value: v || "" };
        });
      const metadata = await nftService.createMetadata({
        name,
        description: desc,
        image_url: image.image_url,
        attributes: parsedAttributes,
      });

      const record = await nftService.createNftRecord({
        owner_address: tonAddressData.address,
        name,
        description: desc,
        image_url: image.image_url,
        metadata_url: metadata.metadata_url,
        status: "pending",
        attributes: parsedAttributes,
      });

      const tx = await tonConnectMarketplaceService.mintNft({
        collectionAddress,
        ownerAddress: tonAddressData.address,
        metadataUrl: metadata.metadata_url,
        itemIndex: Date.now(),
      });

      await nftService.patchNft(record.id, {
        tx_hash: typeof tx === "string" ? tx : (tx as any)?.txHash || null,
        status: "pending",
      });

      Alert.alert("Đã gửi giao dịch mint", "NFT đang chờ sync từ blockchain");
    } catch (e: any) {
      console.log(e);
      Alert.alert("Mint lỗi", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     UI
  =============================== */

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mint NFT</Text>
        <Text style={styles.subtitle}>{isTestnet ? "TON Testnet" : "TON Mainnet"}</Text>

        <TouchableOpacity style={styles.uploadCard} onPress={pickImage} activeOpacity={0.9}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Chọn ảnh NFT</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formCard}>
          <TextInput placeholder="NFT Name" placeholderTextColor="#6B7280" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Description" placeholderTextColor="#6B7280" value={desc} onChangeText={setDesc} style={styles.input} multiline />
          <TextInput
            placeholder="Attributes (rarity:rare,color:blue)"
            placeholderTextColor="#6B7280"
            value={attributes}
            onChangeText={setAttributes}
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={[styles.mintBtn, loading && styles.mintBtnDisabled]} onPress={mint} disabled={loading} activeOpacity={0.9}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mintBtnText}>Mint NFT</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===============================
   STYLE
================================ */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B1220" },
  container: {
    padding: 16,
    gap: 14,
  },
  title: {
    color: "#F9FAFB",
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: { color: "#93C5FD", fontSize: 13, marginTop: -6, marginBottom: 4 },
  uploadCard: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  image: {
    width: "100%",
    height: 220,
  },
  placeholder: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
  },
  placeholderText: { color: "#9CA3AF", fontWeight: "600" },
  formCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  input: {
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 8,
    padding: 12,
    color: "#F9FAFB",
    marginBottom: 10,
    backgroundColor: "#0F172A",
  },
  mintBtn: { backgroundColor: "#2563EB", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 4 },
  mintBtnDisabled: { opacity: 0.7 },
  mintBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
