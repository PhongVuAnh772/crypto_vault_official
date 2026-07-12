import React from 'react';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { MainLayout } from '../components/MainLayout';
import useAddCustomToken from './addCustomToken.evm.hook';

const AddCustomTokenEVM: React.FC<RootNavigationType> = props => {
    const {
        nameToken,
        symbolToken,
        decimalsToken,
        contractAddress,
        showScanQRCamera,
        handleCallBackScanQR,
        onShowScanQRCamera,
        setNameToken,
        setSymbolToken,
        setDecimalsToken,
        setContractAddress,
        handleCopyToClipboard,
        isLoadingPage,
        validateInput,
        editable,
        error,
        handleAddToken,
        onCloseScanQr,
        handleClearData,
    } = useAddCustomToken({
        navigation: props.navigation,
    });
    return (
        <MainLayout
            nameToken={nameToken}
            symbolToken={symbolToken}
            decimalsToken={decimalsToken}
            contractAddress={contractAddress}
            showScanQRCamera={showScanQRCamera}
            handleCallBackScanQR={handleCallBackScanQR}
            onShowScanQRCamera={onShowScanQRCamera}
            setNameToken={setNameToken}
            setSymbolToken={setSymbolToken}
            setDecimalsToken={setDecimalsToken}
            setContractAddress={setContractAddress}
            handleCopyToClipboard={handleCopyToClipboard}
            isLoadingPage={isLoadingPage}
            validateInput={validateInput}
            editable={editable}
            error={error}
            handleAddToken={handleAddToken}
            onCloseScanQr={onCloseScanQr}
            handleClearData={handleClearData}
        />
    );
};

export default AddCustomTokenEVM;
