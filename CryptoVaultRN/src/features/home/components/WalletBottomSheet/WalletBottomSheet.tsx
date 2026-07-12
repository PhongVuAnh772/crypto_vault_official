import React from 'react';
import BottomSheetModal from 'src/components/specific/BottomSheetModal/BottomSheetModal.view';
import BottomSheetWalletView from '../BottomSheetWallet/BottomSheetWallet.view';
import EditModalView from '../EditModalView';
import RemoveModalView from '../RemoveModalView';
import WalletMenuView from '../WalletMenuView';
import {
    MenuActionType,
    WalletBottomSheetType,
} from './WalletBottomSheet.type';

const WalletBottomSheet: React.FC<WalletBottomSheetType> = props => {
    const getSubModalChild = () => {
        switch (props.menuActionType) {
            case MenuActionType.remove:
                return (
                    <RemoveModalView
                        typeWallet
                        onCancel={props.onCloseMenuWallet}
                        onConfirm={props.removeWalletAction}
                    />
                );
            case MenuActionType.edit:
                return (
                    <EditModalView
                        typeWallet
                        onCancel={props.onCloseMenuWallet}
                        onEdit={props.editWalletAction}
                        editWalletName={props.newWalletAddress}
                        setEditWalletName={props.setNewWalletAddress}
                        avtColor={props.avtColor}
                    />
                );

            default:
                return (
                    <WalletMenuView
                        typeWallet
                        hideRemove={props.addressList?.length === 1}
                        menuPosition={props.menuPosition}
                        onEditAction={props.onEditAction}
                        onRemoveAction={props.onRemoveAction}
                    />
                );
        }
    };
    return (
        <BottomSheetModal
            showModal={props.showBottomSheetModal}
            closeModalAction={props.closeModalAction}
            onDismiss={props.onDismiss}
            showSubModal={props.showSubModal}
            onCloseSubModalWhenClickOutside={props.onCloseMenuWallet}
            subModalChild={getSubModalChild()}
            maxHeight={props.maxHeight}
            child={
                <BottomSheetWalletView
                    closeParentBottomSheetModal={props.closeModalAction}
                    isAddView={props.isAddView}
                    setIsAddView={props.setIsAddView}
                    onPressAdd={props.onPressAdd}
                    addressList={props.addressList}
                    protocolBaseData={props.protocolBaseData}
                    selectedAddressId={props.selectedAddressId}
                    handlePressWallet={props.handlePressWallet}
                    onSwipeEdit={props.onSwipeEdit}
                    onSwipeRemove={props.onSwipeRemove}
                />
            }
        />
    );
};

export default WalletBottomSheet;
