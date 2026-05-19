import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import { MarkSvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import useStyles from './selectToken.style';
import { SelectTokenEVMType } from './selectToken.type';

const RenderTokenItem = ({
    item,
    handlePressItem,
    loadingImages,
    setLoadingImages,
}: SelectTokenEVMType) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);

    const handleChecked = () => {
        // const supportedToken = item as SupportedTokenItemWithProtocol;
        // const currentSupportedToken =
        //     currentToken as SupportedTokenItemWithProtocol;
        // if (supportedToken && currentSupportedToken) {
        //     return (
        //         supportedToken.contractAddress ===
        //         currentSupportedToken.contractAddress
        //     );
        // } else if (currentToken?.isNativeToken && item?.isNativeToken) {
        //     return true;
        // }
        return false;
    };
    return (
        <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
                handlePressItem(item);
            }}>
            <View
                style={[
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.justifyContentBetween,
                    styles.tokenItem,
                ]}>
                <View
                    style={[
                        styles.flexRow,
                        styles.alignItemsCenter,
                        styles.flex8,
                    ]}>
                    <AppImage
                        uri={item.logo ?? ''}
                        styleImage={styles.imageToken}
                        isLoading={loadingImages[item.id]?.loading}
                        setIsLoading={setLoadingImages}
                        skeletonRadius={100}
                        bonusId={item.name}
                        defaultImage={appImages.logo}
                    />
                    <AppText
                        title={item.name}
                        variant={TextVariantKeys.titleMedium}
                        styles={styles.name}
                        textColor={theme.colors.text_on_surface_text_high}
                    />
                    <View style={styles.symbol}>
                        <AppText
                            title={item.symbol}
                            variant={TextVariantKeys.labelTiny}
                            textColor={theme.colors.text_on_surface_text_high}
                        />
                    </View>
                </View>
                <View style={[styles.flex1, styles.center]}>
                    {handleChecked() && (
                        <MarkSvgIcon
                            width="16"
                            height="16"
                            color={styles.markIcon.color}
                        />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};
export { RenderTokenItem };
