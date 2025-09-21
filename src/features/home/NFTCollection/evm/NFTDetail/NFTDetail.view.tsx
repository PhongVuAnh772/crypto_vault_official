import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { MoreDynamicIconSvg } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { NFTTokenStandard } from 'src/core/services/Web3/type';
import nftUtils from 'src/core/utils/nftUtils';
import walletUtils from 'src/core/utils/walletUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    BottomSheetMenu,
    DeleteNFTModal,
    TopContentNFTDetails,
} from '../../components';
import useNFTDetail from './NFTDetail.hook';
import useStyles from './NFTDetail.style';

type NFTDetailParams = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.NFTDetail
>;
const NFTDetail: React.FC<RootNavigationType> = ({ navigation }) => {
    const NFT = useRoute<NFTDetailParams>().params;
    const { detail, root } = NFT;
    const image = detail.image || detail.image_data || '';
    const imageUri = nftUtils.convertIpfsUrl(image);
    const tokenStandard = detail?.tokenStandard || 'ERC721';
    const isERC1155 = tokenStandard === NFTTokenStandard.ERC1155;

    const {
        isLoadings,
        setLoadings,
        handlePressURL,
        showModal,
        onHideModal,
        onShowModal,
        onDeleteNFT,
        onHideConfirmModal,
        handleDeleteNFT,
        showConfirmDeleteModal,
        onBottomSheetClose,
        bottomSheetClose,
        newUI,
        insets,
        onClickSendButton,
        copyAction,
    } = useNFTDetail(NFT, { navigation });
    const theme = useAppTheme();
    const NFTDetailStyle = useStyles(theme, insets);
    return (
        <ScreenWrapper
            bounces
            enableHeader
            paddingTop
            paddingBottom={!newUI}
            headerTitle={detail.name}
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI ? appColors.main.tokyoRed : appColors.neutral.n100
            }
            iconRight={
                <MoreDynamicIconSvg
                    onPress={onShowModal}
                    height={26}
                    width={26}
                    color={
                        newUI ? appColors.neutral.white : appColors.neutral.n800
                    }
                />
            }>
            <ScrollView style={[{ backgroundColor: appColors.neutral.n100 }]}>
                <BottomSheetMenu
                    onClose={onHideModal}
                    onDelete={onDeleteNFT}
                    showModal={showModal}
                    onDismiss={onBottomSheetClose}
                />
                <TopContentNFTDetails
                    isLoading={isLoadings[imageUri]?.loading}
                    setLoadings={setLoadings}
                    typeNFT={detail?.tokenStandard}
                    imageUri={imageUri}
                    uriNetwork={detail.network_image ?? ''}
                    isERC1155={isERC1155}
                    detailName={detail.name}
                    detailId={detail.nftId ?? ''}
                    tokenStandard={tokenStandard}
                    quantity={detail?.quantity ?? 0}
                    handlePressURL={handlePressURL}
                    contractAddress={walletUtils.getShortAddress(
                        root.contractAddress,
                    )}
                    copyAction={copyAction}
                    description={detail.description}
                />

                <DeleteNFTModal
                    onCancel={onHideConfirmModal}
                    onConfirm={() => handleDeleteNFT(NFT)}
                    showModal={showConfirmDeleteModal && bottomSheetClose}
                    detailName={NFT.detail.name}
                />
            </ScrollView>

            <View style={NFTDetailStyle.viewButtonSend}>
                {newUI ? (
                    <AppButtonSVG
                        onPress={onClickSendButton}
                        titleWithI18n={LanguageKey.home_send_title}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        SvgView={SvgView.button}
                        buttonHeight={48}
                    />
                ) : (
                    <AppButton
                        onPress={onClickSendButton}
                        titleWithI18n={LanguageKey.home_send_title}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        styles={NFTDetailStyle.button}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default NFTDetail;
