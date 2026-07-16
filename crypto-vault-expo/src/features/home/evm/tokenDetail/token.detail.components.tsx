import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import AppImage from 'src/components/common/AppImage';
import ViewModeButton from 'src/components/common/ViewModeButton/ViewModeButton';
import appStyles from 'src/core/styles';

type ImageType = {
    uri: string;
};
const ImageTokenDetail = ({uri}: ImageType) => {
    return (
        <AppImage
            uri={uri}
            styleImage={appStyles.iconCircleSize50}
            skeletonRadius={100}
        />
    );
};
type RenderFooterType = {
    isLoading: boolean;
    isShowViewMore: boolean;
    onPressViewMore: () => void;
};
const RenderFooter = ({
    isLoading,
    isShowViewMore,
    onPressViewMore,
}: RenderFooterType) => {
    if (isShowViewMore) {
        return (
            <View style={appStyles.center}>
                <ViewModeButton viewMoreHistory={onPressViewMore} />
            </View>
        );
    }
    if (isLoading) {
        return <ActivityIndicator size="small" style={appStyles.pV10} />;
    }
    return null;
};
export {ImageTokenDetail, RenderFooter};
