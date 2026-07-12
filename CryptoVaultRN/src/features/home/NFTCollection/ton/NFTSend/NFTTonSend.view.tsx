import React from 'react';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { NFTSendTon } from './NFTTonSend.component';
import useNFTSend from './NFTTonSend.hook';

const NFTTonSend: React.FC<RootNavigationType> = props => {
    const {
        handleOnClickContinue,
        walletAddress,
        setWalletAddress,
        handleCopyToClipboard,
        showScanQRCamera,
        isLoadingPage,
        handleConfirm,
        showModalConfirmTransaction,
        handleCallBackScanQR,
        onShowScanQRCamera,
        handleBack,
        error,
        handleUnderstood,
        isLoadingSkeleton,
        onSubmitWalletAddress,
        nftData,
        requirePinCode,
        closeRequirePinCode,
        bottomSheetSendMaximum,
        onCloseBottomSheetSendMaximum,
        codeScanner,
        inputRecipientAddress,
        toAddressError,
        adminFee,
        networkFee,
        onCloseScanQr,
        dismissModalConfirm,
        fromAddress,
        toAddress,
        sign,
        currentProtocol,
        confirmAction,
        errorBalance,
        errorBalanceCover,
        hidingErrorBalance,
    } = useNFTSend({
        navigation: props.navigation,
    });

    const { detail, root } = nftData;

    return (
        <NFTSendTon
            handleBack={handleBack}
            showScanQRCamera={showScanQRCamera}
            isLoadingSkeleton={isLoadingSkeleton}
            root={root}
            detail={detail}
            handleCopyToClipboard={handleCopyToClipboard}
            error={error}
            setWalletAddress={setWalletAddress}
            handleOnClickContinue={handleOnClickContinue}
            onSubmitWalletAddress={onSubmitWalletAddress}
            onShowScanQRCamera={onShowScanQRCamera}
            walletAddress={walletAddress}
            showModal={showModalConfirmTransaction}
            handleCallBackScanQR={handleCallBackScanQR}
            isLoadingPage={isLoadingPage}
            props={props}
            handleConfirm={handleConfirm}
            handleUnderstood={handleUnderstood}
            isNotOwner={false}
            requirePinCode={requirePinCode}
            closeRequirePinCode={closeRequirePinCode}
            bottomSheetSendMaximum={bottomSheetSendMaximum}
            onCloseBottomSheetSendMaximum={onCloseBottomSheetSendMaximum}
            codeScanner={codeScanner}
            inputRecipientAddress={inputRecipientAddress}
            toAddressError={toAddressError}
            adminFee={adminFee}
            networkFee={networkFee}
            onModalConfirmDismiss={dismissModalConfirm}
            fromAddress={fromAddress ?? ''}
            fromAmount={`0`}
            fromSubAmount={`0`}
            confirmAction={confirmAction}
            toAddress={toAddress}
            onClose={() => {}}
            sign={sign}
            currentProtocol={currentProtocol}
            errorBalance={errorBalance}
            errorBalanceCover={errorBalanceCover}
            onCloseScanQr={onCloseScanQr}
            hidingErrorBalance={hidingErrorBalance}
        />
    );
};

export default NFTTonSend;
