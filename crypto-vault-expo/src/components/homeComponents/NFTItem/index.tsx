import React from 'react';
import { View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import { appImages } from 'src/core/constants/AppImages';
import nftUtils from 'src/core/utils/nftUtils';
import { NFTType } from 'src/features/home/bottomTab/NFTCollection/NFTCollectionTab/evm/NFTCollection.type';
import NFTItemStyle from './NFTitem.style';

type NFTItemProps = {
    item: NFTType;
    index: number;
    onPress: (e: NFTType) => void;
    setIsLoading: (uri: string, value: boolean) => void;
    isLoading: boolean;
};
const NFTItem = ({
    item,
    index,
    onPress,
    isLoading,
    setIsLoading,
}: NFTItemProps) => {
    const containerStyle =
        index % 2 === 0 ? NFTItemStyle.pr8 : NFTItemStyle.pl8;
    const image = nftUtils.convertIpfsUrl(item.image ?? '');
    const imageURi = image || item.image_data || '';

    return (
        <View style={[NFTItemStyle.flexHalf]}>
            <AppImage
                uri={imageURi}
                name={item.name}
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

export default NFTItem;
