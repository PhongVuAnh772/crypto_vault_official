import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import appStyles from "src/core/styles";

type Props = {
    title: string;
    value?: string | null;
    value2?: string | null;
    containerStyle?: StyleProp<ViewStyle>;
};

const RowItem = ({ title, value, value2, containerStyle }: Props) => {
    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.justifyContentBetween,
                appStyles.pv16,
                appStyles.ph12,
                containerStyle,
            ]}>
            <AppText
                title={title}
                styles={appStyles.textAlignLeft}
                variant={TextVariantKeys.bodyMMedium}
                textColor={appColors.neutral.n500}
            />
            <View>
                <AppText
                    title={value ?? ""}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={appColors.neutral.n800}
                    styles={appStyles.textAlignRight}
                />
                {value2 && (
                    <AppText
                        title={value2}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.n800}
                        styles={appStyles.textAlignRight}
                    />
                )}
            </View>
        </View>
    );
};

export default RowItem;
