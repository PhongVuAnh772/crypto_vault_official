import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { launchImageLibrary } from "react-native-image-picker";

import RequirePinCodeLayout from "src/components/layout/RequirePinCode/requirePinCode.view";

import { useTonAddressData } from "src/core/redux/slice/account.selector";

import TonUtils from "src/core/utils/tonUtils";
import { MintFlow } from "./mint.flow";
import { PinataService } from "./services/pinata.service";

export default function MintNftScreen() {
  const tonAddressData = useTonAddressData();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModalConfirmTransaction, setShowModalConfirmTransaction] =
    useState(false);

  /* ===============================
     PICK IMAGE
  =============================== */

  const pickImage = async () => {
    const res = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.9,
      selectionLimit: 1,
    });

    if (res.assets?.length) {
      setImageUri(res.assets[0].uri || null);
    }
  };

  /* ===============================
     MINT
  =============================== */

  const mint = async (pinCode: string) => {
    if (!imageUri || !name || !tonAddressData) {
      Alert.alert("Thiếu dữ liệu");
      return;
    }

    try {
      setShowModalConfirmTransaction(false);
      setLoading(true);

      /* ---------- Upload image ---------- */
      const imageHash = await PinataService.uploadFile(imageUri);

      /* ---------- Mint ---------- */
       const getSecretKey = TonUtils.merKeyToGetSecretKey(
         tonAddressData.privateKey,
         tonAddressData.publicKey,
       );
      const result = await MintFlow.mintNFT({
        imageHash,
        name,
        description: desc,
        publicKey: tonAddressData.publicKey,
        secretKey: getSecretKey,
        ownerAddress: tonAddressData.address,
        collectionAddress: "EQApuxGj7u6InoEKfIdnsva3qdceUSBw-mitiMPMu7Q5LnMU",
      });

      Alert.alert("Mint thành công 🎉", JSON.stringify(result, null, 2));
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
    <View style={styles.container}>
      <Text style={styles.title}>Mint NFT</Text>

      <Button title="Chọn ảnh" onPress={pickImage} />

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <TextInput
        placeholder="NFT Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button
          title="Mint NFT"
          onPress={() => setShowModalConfirmTransaction(true)}
        />
      )}

      <RequirePinCodeLayout
        visible={showModalConfirmTransaction}
        continueActionAfterPassPinCode={mint}
        onClose={() => setShowModalConfirmTransaction(false)}
      />
    </View>
  );
}

/* ===============================
   STYLE
================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    alignSelf: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
});
