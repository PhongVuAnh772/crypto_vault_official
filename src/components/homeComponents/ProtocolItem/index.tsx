import React from 'react';
import { View } from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { LoadingImage } from 'src/components/common/AppImage/type';
import AppText from 'src/components/common/AppText';
import ProtocolImage from 'src/components/specific/ProtocolImage';
import appColors from 'src/core/constants/AppColors';
import { MarkSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import protocolItemStyle from './style';

type ProtocolType = {
    item: ProtocolDataWithSupportedTokensFormBEType;
    selected?: boolean | null;
    onPress?: (value: ProtocolDataWithSupportedTokensFormBEType) => void;
    setLoadingImages: (uri: string, value: boolean) => void;
    isLoadingImage: LoadingImage;
    theme: AppThemeType;
};
const ProtocolItem = ({
    selected,
    isLoadingImage,
    onPress,
    theme,
    item,
    setLoadingImages,
}: ProtocolType) => {
    return (
        <TouchableHighlight
            activeOpacity={0.9}
            underlayColor={appColors.neutral.n200}
            onPress={() => {
                if (onPress) {
                    onPress(item);
                }
            }}
            style={[
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                appStyles.justifyContentBetween,
                protocolItemStyle.listProtocolItem,
            ]}>
            <>
                <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                    <ProtocolImage
                        protocolData={item}
                        size={28}
                        bonusId={item._id}
                        isLoadingImage={
                            isLoadingImage[item.logo + item._id]?.loading
                        }
                        logoUri={item.logo}
                        setLoadingImages={setLoadingImages}
                    />
                    <AppText
                        title={item.name}
                        variant={TextVariantKeys.titleMedium}
                        styles={protocolItemStyle.nameProtocol}
                        textColor={theme.colors.text_on_surface_text_high}
                    />
                    <View style={protocolItemStyle.shortCurrencyContainer}>
                        <AppText
                            title={item.symbol}
                            variant={TextVariantKeys.labelTiny}
                            textColor={theme.colors.text_on_surface_text_medium}
                        />
                    </View>
                </View>
                <View>
                    {selected && (
                        <MarkSvgIcon
                            width="16"
                            height="16"
                            style={protocolItemStyle.markIconProtocol}
                        />
                    )}
                </View>
            </>
        </TouchableHighlight>
    );
};

export default ProtocolItem;
