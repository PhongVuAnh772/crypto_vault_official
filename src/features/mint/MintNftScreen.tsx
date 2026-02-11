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
import { MintFlow } from "./mint.flow";

export default function MintNftScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const mnemonic = [
    "replace",
    "gain",
    "photo",
    "one",
    "rapid",
    "cool",
    "luggage",
    "stay",
    "dwarf",
    "bridge",
    "tattoo",
    "silly",
  ];

  const pickImage = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.9,
        selectionLimit: 1,
      });

      if (res.didCancel) return;

      if (res.errorCode) {
        Alert.alert("Lỗi chọn ảnh", res.errorMessage || "Unknown error");
        return;
      }

      if (res.assets?.length) {
        setImageUri(res.assets[0].uri || null);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const mint = async () => {
    if (!imageUri || !name) {
      Alert.alert("Thiếu dữ liệu");
      return;
    }

    try {
      setLoading(true);

      const result = await MintFlow.mintNFT({
        imageUri,
        mnemonic,
        name,
        description: desc,
        collectionAddress: "",
      });

      Alert.alert("Mint xong 🎉", JSON.stringify(result, null, 2));
    } catch (e: any) {
      console.log(e);
      Alert.alert("Mint lỗi", e.message);
    } finally {
      setLoading(false);
    }
  };

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
        <Button title="Mint NFT" onPress={mint} />
      )}
    </View>
  );
}

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
