import React from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import LoadingScreen from "components/LoadingComponent";
import AppText from "src/components/common/AppText";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import appStyles from "src/core/styles";
import { RootNavigationType } from "../SplashScreen/index.view";
import useShowPassPhrase from "./ValidatePassPhrase.hook";
import useStyles from "./ValidatePassPhrase.styles";

const ValidatePassPhrase: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    isMiddleItem,
    handleLayout,
    secretPhraseInputs,
    userInputs,
    missingWords,
    visibleLoading,
    handleValidate,
    handleFillWord,
    missingIndexes,
    statusLoading,
    onAnimationFinish,
  } = useShowPassPhrase({ navigation });

  const styles = useStyles();

  const renderItem = ({ index }: { index: number }) => {
    const isMissing = missingIndexes.includes(index);

    return (
      <View
        onLayout={handleLayout}
        style={[isMiddleItem(index) ? appStyles.mh5 : null, styles.inputSecret]}
      >
        <View style={[appStyles.flexRow, { alignItems: "center" }]}>
          <View style={styles.indexView}>
            <AppText
              title={(index + 1).toString()}
              variant={TextVariantKeys.bodyMMedium}
              styles={appStyles.textAlignCenter}
            />
          </View>
          <TextInput
            secureTextEntry={true}
            editable={false}
            style={[styles.input, { flex: 1, backgroundColor: "white" }]}
            value={isMissing ? userInputs[index] : secretPhraseInputs[index]}
          />
        </View>
      </View>
    );
  };

  const renderButtonPhrase = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    return (
      <View
        onLayout={handleLayout}
        style={[isMiddleItem(index) ? appStyles.mh5 : null, styles.inputSecret]}
      >
        <TouchableOpacity
          style={[appStyles.flexRow, { alignItems: "center" }]}
          onPress={() => handleFillWord(item)}
        >
          <View style={[styles.input, { flex: 1, backgroundColor: "white" }]}>
            <Text style={{ fontSize: 14 }}>{item}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <AppText
          title="Bước 2/2"
          variant={TextVariantKeys.bodyMSmall}
          textColor="#8E8E93"
        />
        <AppText
          title="Cụm từ bí mật"
          variant={TextVariantKeys.headlineSmall}
          textColor="#000000"
          styles={{ fontWeight: "700" }}
        />
        <View style={[styles.row, { paddingTop: 5 }]}>
          <AppText
            title="Chọn đúng 3 từ bị ẩn để xác nhận cụm từ bí mật"
            variant={TextVariantKeys.bodyMLarge}
            textColor="#6E6E73"
          />
        </View>

        <View style={styles.secretPhraseContainer}>
          <View style={styles.secretContainer}>
            <FlatList
              scrollEnabled={false}
              data={secretPhraseInputs}
              renderItem={({ index }) => renderItem({ index })}
              keyExtractor={(_, index) => index.toString()}
              numColumns={3}
              contentContainerStyle={styles.grid}
            />
          </View>
          <View style={styles.buttonPhraseContainer}>
            <FlatList
              scrollEnabled={false}
              data={missingWords}
              renderItem={({ item, index }) =>
                renderButtonPhrase({ item, index })
              }
              keyExtractor={(_, index) => index.toString()}
              numColumns={3}
              contentContainerStyle={styles.grid}
            />
          </View>
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
          onPress={handleValidate}
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
      <LoadingScreen
        visible={visibleLoading}
        status={statusLoading}
        onAnimationFinish={onAnimationFinish}
      />
    </>
  );
};

export default ValidatePassPhrase;
