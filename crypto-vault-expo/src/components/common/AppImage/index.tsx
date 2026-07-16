import { BlurView } from 'expo-blur';
import React from 'react';
import {
    Pressable,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import FastImage, {
    ImageStyle as FastImageStyle,
} from 'react-native-fast-image';
import appColors from 'src/core/constants/AppColors';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import AppSkeletonLoading from '../AppSkeletonLoading';
import AppText from '../AppText';
import imageStyle from './style';
import { NameImageType } from './type';

type AppImageType = {
    uri?: string;
    containerStyle?: StyleProp<ViewStyle>;
    styleImage?: StyleProp<FastImageStyle>;
    styleNetworkImage?: StyleProp<FastImageStyle>;
    height?: number;
    width?: number;
    showName?: boolean;
    name?: string;
    networkImage?: string;
    skeletonRadius?: number | 'round' | 'square';
    defaultImage?: number;
    onPress?: () => void;
    setIsLoading?: (uri: string, value: boolean) => void;
    isLoading?: boolean;
    bonusId?: string;
    NotUsingRadius?: boolean;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
    numberOfLines?: number;
    loadingHeight?: number;
};

const AppImage = ({
    containerStyle,
    uri,
    styleImage,
    height,
    width,
    showName,
    name,
    networkImage,
    styleNetworkImage,
    skeletonRadius,
    defaultImage = appImages.logo,
    onPress,
    setIsLoading,
    isLoading,
    bonusId = '',
    NotUsingRadius = false,
    resizeMode = 'contain',
    numberOfLines,
    loadingHeight,
}: AppImageType) => {
    const flattenedStyleImage = StyleSheet.flatten(styleImage);
    const imageHeight = (height ?? flattenedStyleImage?.height) || 180;
    const imageWidth = (width ?? flattenedStyleImage?.width) || '100%';

    const handleLoadEnd = () => {
        if (uri && setIsLoading) {
            setIsLoading(uri + bonusId, false);
        }
    };

    const handleLoadStart = () => {
        if (uri && setIsLoading) {
            setIsLoading(uri + bonusId, true);
        }
    };

    const onPressImage = () => {
        if (onPress) {
            onPress();
        }
    };

    const isLocalAsset = typeof uri === 'number';
    const source = isLocalAsset
        ? uri
        : {
              uri,
              priority: FastImage.priority.high,
              Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          };

    const uriEmpty = !uri;

    const isAndroidAndShowDefaultImage = Utils.isAndroid && uriEmpty;

    return (
        <Pressable
            style={[imageStyle.container, containerStyle]}
            disabled={isLoading}
            onPress={onPressImage}>
            {isLoading && (
                <AppSkeletonLoading
                    width={imageWidth}
                    height={loadingHeight ?? imageHeight}
                    radius={skeletonRadius}
                />
            )}
            {isAndroidAndShowDefaultImage ? (
                <FastImage
                    source={defaultImage}
                    style={[
                        imageStyle.image,
                        { height, width },
                        styleImage,
                        isLoading ? imageStyle.loading : null,
                        NotUsingRadius && { borderRadius: 0 },
                    ]}
                    resizeMode={resizeMode}
                />
            ) : null}

            <FastImage
                source={source}
                style={[
                    imageStyle.image,
                    {
                        height,
                        width,
                        backgroundColor: isAndroidAndShowDefaultImage
                            ? 'transparent'
                            : undefined,
                    },
                    styleImage,
                    isLoading ? imageStyle.loading : null,
                    NotUsingRadius && { borderRadius: 0 },
                    isAndroidAndShowDefaultImage
                        ? appStyles.positionAbsolute
                        : null,
                ]}
                resizeMode={resizeMode}
                onLoadStart={handleLoadStart}
                onLoadEnd={handleLoadEnd}
                defaultSource={isLocalAsset ? undefined : defaultImage}>
                <View>
                    {networkImage && !isLoading && (
                        <FastImage
                            source={{
                                uri: networkImage,
                            }}
                            style={[imageStyle.networkImage, styleNetworkImage]}
                            resizeMode="cover"
                        />
                    )}
                </View>
            </FastImage>

            <NameImage
                showName={showName}
                name={name}
                isLoading={isLoading}
                numberOfLines={numberOfLines}
            />
        </Pressable>
    );
};

const NameImage = ({
    showName,
    isLoading,
    name,
    numberOfLines,
}: NameImageType) => {
    return (
        showName &&
        !isLoading && (
            <View>
                <BlurView
                    style={imageStyle.blur}
                    intensity={40}
                    tint="systemMaterialDark">
                    <AppText
                        title={name}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor={appColors.neutral.white}
                        styles={Utils.isAndroid && imageStyle.textBlurAndroid}
                        numberOfLines={numberOfLines}
                    />
                </BlurView>
            </View>
        )
    );
};

export default AppImage;
