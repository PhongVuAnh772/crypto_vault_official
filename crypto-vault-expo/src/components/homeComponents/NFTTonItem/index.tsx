import React from 'react';
import { View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import { appImages } from 'src/core/constants/AppImages';
import { NFTTonType } from 'src/core/redux/slice/NFT/NFTImport.type';
import Utils from 'src/core/utils/commonUtils';
import NFTItemStyle from './NFTTonitem.style';

type NFTTonItemProps = {
    item: NFTTonType;
    index: number;
    onPress: (e: NFTTonType) => void;
    setIsLoading: (uri: string, value: boolean) => void;
    isLoading: boolean;
};
const NFTTonItem = ({
    item,
    index,
    onPress,
    isLoading,
    setIsLoading,
}: NFTTonItemProps) => {
    const containerStyle =
        index % 2 === 0 ? NFTItemStyle.pr8 : NFTItemStyle.pl8;
    return (
        <View style={NFTItemStyle.flexHalf}>
            <AppImage
                uri={item.image_data}
                name={`${Utils.truncateText(item.nftDetailAll.metadata?.name || item.nftDetailAll.collection?.name)} #${item.nftDetailAll.index}`}
                styleImage={NFTItemStyle.avatarDetail}
                containerStyle={[containerStyle, NFTItemStyle.mbt15]}
                showName={true}
                networkImage={item.network_image}
                onPress={() => onPress(item)}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
                defaultImage={appImages.NFTDefault}
            />
        </View>
    );
};

export default NFTTonItem;
