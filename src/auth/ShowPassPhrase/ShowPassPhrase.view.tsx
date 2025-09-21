import React from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import AppText from "components/AppText";
import TextVariantKeys from "src/core/constants/TextVariantKeys";
import appStyles from "src/core/styles";
import { RootNavigationType } from "../SplashScreen/index.view";
import useShowPassPhrase from "./ShowPassPhrase.hook";
import useStyles from "./ShowPassPhrase.styles";

const ShowPassPhrase: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    isMiddleItem,
    handleLayout,
    secretPhraseInputs,
    handleContinueStep,
    handleCopy,
  } = useShowPassPhrase({
    navigation,
  });

  const styles = useStyles();

  const renderItem = ({ index }: { index: number }) => (
    <View
      onLayout={handleLayout}
      style={[isMiddleItem(index) ? appStyles.mh5 : null, styles.inputSecret]}
    >
      <View style={[appStyles.flexRow, { alignItems: "center" }]}>
        <View style={styles.indexView}>
          <AppText
            title={(index + 1).toString()}
            variant={TextVariantKeys.BodyMedium}
            styles={appStyles.textAlignCenter}
          />
        </View>
        <TextInput
          editable={false}
          style={[styles.input, { flex: 1 }]}
          value={secretPhraseInputs[index]}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppText
        title="Bước 1/2"
        variant={TextVariantKeys.BodySmall}
        textColor="#8E8E93"
      />
      <AppText
        title="Cụm từ bí mật"
        variant={TextVariantKeys.DisplaySmall}
        textColor="#000000"
        styles={{ fontWeight: "700" }}
      />
      <View style={[styles.row, { paddingTop: 5 }]}>
        <AppText
          title="Hãy cẩn thận bảo mật những cụm từ này"
          variant={TextVariantKeys.BodyLarge}
          textColor="#6E6E73"
        />
        <Feather
          name="info"
          size={18}
          color="#6E6E73"
          style={styles.infoIcon}
        />
      </View>

      <View style={styles.secretPhraseContainer}>
        <View style={styles.secretContainer}>
          <FlatList
            scrollEnabled={false}
            data={secretPhraseInputs.map((_, index) => ({
              key: index.toString(),
            }))}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            numColumns={3}
            contentContainerStyle={styles.grid}
          />
        </View>

        <TouchableOpacity style={styles.copyContainer} onPress={handleCopy}>
          <Feather name="copy" size={18} color="#7A94FF" />
          <AppText
            title={"Sao chép cụm từ bí mật"}
            variant={TextVariantKeys.TitleSmall}
            styles={appStyles.textAlignCenter}
            textColor="#7A94FF"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 13,
          position: "absolute",
          left: 16,
          bottom: 30,
          width: "100%",
          backgroundColor: "#7A94FF",
          borderRadius: 10,
        }}
        onPress={() => {
          handleContinueStep();
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: "700",
          }}
        >
          Tiếp tục
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShowPassPhrase;
