import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    EmptyHistorySwap,
    HeaderList,
    HistoryItem,
    ProtocolListBottomSheet,
    WalletBottomSheet,
} from '../components';
import useSwapHistory from './swapHistory.hook';

const SwapHistoryView: React.FC<RootNavigationType> = ({ navigation }) => {
    const insets = useAppSafeAreaInsets();
    const {
        data,
        loadMore,
        hasMore,
        isRefreshing,
        onRefresh,
        onPressProtocol,
        isLoadingMore,
        refModal,
        protocolList,
        onCloseModalProtocol,
        protocolSelected,
        onPressProtocolItem,
        onPressHistory,
        listWalletByType,
        refWalletManagement,
        onShowModalWalletManagement,
        onCloseModalWalletManagement,
        currentWalletSelected,
        onSelectWallet,
        listImage,
        isLoading,
    } = useSwapHistory({ navigation });
    return (
        <>
            <FlatList
                data={data}
                renderItem={({ item, index }) => (
                    <HistoryItem
                        item={item}
                        index={index}
                        length={data.length}
                        onPress={() => onPressHistory(item)}
                        listImage={listImage}
                    />
                )}
                keyExtractor={item => item.createdAt + item.exchangeId}
                ListHeaderComponent={
                    <HeaderList
                        onPressProtocol={onPressProtocol}
                        protocolSelected={protocolSelected ?? null}
                        onPressWallet={onShowModalWalletManagement}
                        nameWallet={currentWalletSelected?.name ?? ''}
                    />
                }
                contentContainerStyle={[
                    appStyles.pT10,
                    { paddingBottom: insets.bottom },
                ]}
                onEndReached={hasMore ? loadMore : undefined}
                onEndReachedThreshold={0.3}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListFooterComponent={
                    isLoadingMore ? (
                        <ActivityIndicator size="small" color="red" />
                    ) : null
                }
                ListEmptyComponent={isLoading ? null : EmptyHistorySwap}
            />
            <ProtocolListBottomSheet
                refModal={refModal}
                handlePressProtocol={onPressProtocolItem}
                onCloseModalProtocol={onCloseModalProtocol}
                protocolList={protocolList}
                selectedProtocolId={protocolSelected?._id ?? ''}
            />
            <WalletBottomSheet
                walletList={listWalletByType}
                onClose={onCloseModalWalletManagement}
                refModal={refWalletManagement}
                walletListId={currentWalletSelected?.id ?? ''}
                handlePressWallet={onSelectWallet}
            />
        </>
    );
};

export default SwapHistoryView;
