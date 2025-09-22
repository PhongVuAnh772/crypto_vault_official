import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    View,
} from 'react-native';
import AppModal from 'src/components/common/AppModal';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import appColors from 'src/core/constants/AppColors';
import { DangerSvgIcon } from 'src/core/constants/AppIconsSvg';
import { UnAddedType } from 'src/core/enum/UnAddedType';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import TypeUnAddedNFTModal from '../components/ButtonType';
import EmptyCollection from '../components/emptyCollection';
import EVMNFTitem from '../components/evmNFTitem';
import FilterSelector from '../components/filterSelector';
import LoadingContainer from '../components/loadingList';
import Separator from '../components/separator';
import UnAddedNFTTabModalHeader from '../components/unAddedNFTTabModalHeader';
import useUnAddedNFTTab from './evm.hook';
import styles from './evm.style';

const EVMUnAddedScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        collections,
        initialLoading,
        refreshing,
        onRefresh,
        handlingCheckingSpam,
        enablePagination,
        handlingPagination,
        typeSelect,
        handlingCollectionArchivedNavigating,
        nftArchivedSpam,
        modalWarning,
        handleConfirm,
        handleArchiving,
        showBottomSheetModal,
        closeBottomSheet,
        changeTypeSelect,
        bottomSheetSelectorRef,
        newUI,
    } = useUnAddedNFTTab({
        navigation,
    });
    const isArchived = typeSelect === UnAddedType.Archived;

    return (
        <View style={[appStyles.flex1]}>
            {collections ? (
                <FlatList
                    contentContainerStyle={[
                        appStyles.pH25,
                        appStyles.pB15,
                        appStyles.pT10,
                    ]}
                    ListHeaderComponent={
                        <FilterSelector
                            typeSelect={typeSelect}
                            onPress={showBottomSheetModal}
                        />
                    }
                    data={isArchived ? nftArchivedSpam : collections}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    renderItem={({ item }) => (
                        <EVMNFTitem
                            collection={item}
                            handlingCheckingSpam={() =>
                                handlingCheckingSpam(item)
                            }
                            handlingCollectionArchivedNavigating={
                                handlingCollectionArchivedNavigating
                            }
                            isArchived={isArchived}
                        />
                    )}
                    onEndReached={() => handlingPagination()}
                    onEndReachedThreshold={0.2}
                    ItemSeparatorComponent={Separator}
                    ListFooterComponent={
                        enablePagination ? (
                            <View style={appStyles.mt15}>
                                <ActivityIndicator size="small" />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={appStyles.flex1}>
                            <EmptyCollection />
                        </View>
                    }
                />
            ) : (
                <LoadingContainer
                    loading={initialLoading}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                />
            )}
            <AppModal
                titleWithI18n={LanguageKey.un_added_nfts_spam_title}
                subTitleWithI18n={LanguageKey.un_added_nfts_spam_sub_title}
                visible={modalWarning}
                onPress={handleConfirm}
                buttonTitleWithI18n={LanguageKey.common_understood}
                onPress2={handleArchiving}
                twoOptionsVertical={true}
                buttonTitleWithI18n2={LanguageKey.nft_action_archive}
                button2Styles={newUI ? null : styles.button}
                textButtonSecondColor={appColors.main.tokyoRed}
                icon={<DangerSvgIcon />}
                subTitleWithI18n2={LanguageKey.un_added_nfts_spam_sub_title_2}
            />
            <BottomSheetModalGorhom
                refModal={bottomSheetSelectorRef}
                snapPoints={['30']}>
                <UnAddedNFTTabModalHeader
                    title={LanguageKey.select_type_title}
                    closeModal={closeBottomSheet}
                />
                <View style={styles.containerSelector}>
                    <TypeUnAddedNFTModal
                        closeModal={closeBottomSheet}
                        typeSelect={typeSelect}
                        setTyeSelect={changeTypeSelect}
                    />
                </View>
            </BottomSheetModalGorhom>
        </View>
    );
};

export default EVMUnAddedScreen;
