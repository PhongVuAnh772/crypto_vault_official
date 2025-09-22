import React from 'react';
import { TabView } from 'react-native-tab-view';
import { ScreenWrapper } from 'src/components';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import appColors from 'src/core/constants/AppColors';
import { appImages } from 'src/core/constants/AppImages';
import { ClaimTokenTab } from 'src/core/enum/ClaimTokenTab';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    BottomSheetInstructionLinkingWallet,
    ModalLinkingWallet,
    RenderTabBar,
} from './details/projectDetails.component';
import ProjectDetail from './details/projectDetails.view';
import useProjectDetailTab from './index.hook';
import { useTabStyles } from './index.style';
import TransactionHistoryProject from './transaction/transactionProject.view';
const ProjectDetailsWrapper: React.FC<RootNavigationType> = ({
    navigation,
    route,
}) => {
    const { props } = route.params;
    const theme = useAppTheme();
    const styles = useTabStyles(theme);
    const {
        continueActionAfterPassPinCode,
        setContractTonAddress,
        contractTonAddress,
        closeRequirePinCode,
        requirePinCode,
        showRequirePinCode,
        loadingLinking,
        handleHideInstruction,
        enableInstruction,
        handleShowInstruction,
        insets,
        bottomSheetRef,
        initialLayout,
        routes,
        newUI,
        index,
        handleIndexChange,
        backAction,
        onCloseScanQr,
        showScanQRCamera,
        handleCallBackScanQR,
        continueActionForSecondSheet,
        handleHidePinCodeInstruction,
        bottomSheetSecondRef,
        handleShowPinCodeInstruction,
        setShowImportLinking,
        handleContractAddress,
        handleCheckProtocolLinkingAction,
        showImportLinking,
        handleCopyToClipboard,
        isFocus,
        onFoCus,
        onBlur,
        errorValidAddress,
        onShowScanQr,
        setErrorValidAddress,
    } = useProjectDetailTab(navigation);
    const renderScene = ({
        route,
    }: {
        route: { key: string; title: string };
    }) => {
        switch (route.key) {
            case ClaimTokenTab.ProjectDetail:
                return (
                    <ProjectDetail
                        props={props}
                        navigation={navigation}
                        setContractTonAddress={setContractTonAddress}
                        contractTonAddress={contractTonAddress}
                        showRequirePinCode={showRequirePinCode}
                        loadingLinking={loadingLinking}
                        handleShowInstruction={handleShowInstruction}
                        handleShowPinCodeInstruction={
                            handleShowPinCodeInstruction
                        }
                        showImportLinking={showImportLinking}
                        setShowImportLinking={setShowImportLinking}
                    />
                );
            case ClaimTokenTab.HistoryDetail:
                return <TransactionHistoryProject props={props} />;

            default:
                return null;
        }
    };

    return (
        <>
            <ScreenWrapper
                paddingTop
                enableHeader
                headerTitle={props?.projectName}
                headerTextVariant={TextVariantKeys.titleMedium}
                enableWidthLimit
                backAction={backAction}
                maxFontSizeMultiplier={1.2}
                styleWidthLimitContainer={styles.widthLimitContainer}
                backgroundImage={newUI ? undefined : appImages.background1}
                onCloseScanQR={onCloseScanQr}
                showScanQRCamera={showScanQRCamera}
                headerTextColor={newUI ? appColors.neutral.white : undefined}
                backButtonColor={newUI ? appColors.neutral.white : undefined}
                backgroundColor={newUI ? appColors.main.tokyoRed : undefined}
                callBackWhenScanQR={handleCallBackScanQR}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={handleIndexChange}
                    initialLayout={initialLayout}
                    renderTabBar={props => <RenderTabBar {...props} />}
                    lazy={true}
                    lazyPreloadDistance={1}
                    style={styles.backgroundContainer}
                />
            </ScreenWrapper>

            <RequirePinCodeLayout
                visible={requirePinCode}
                onClose={closeRequirePinCode}
                continueActionAfterPassPinCode={continueActionAfterPassPinCode}
            />
            <BottomSheetInstructionLinkingWallet
                isVisible={enableInstruction}
                closeModalCreateNewWallet={handleHideInstruction}
                continueAction={handleHideInstruction}
                onDismiss={handleHideInstruction}
                insets={insets}
                bottomSheetRef={bottomSheetRef}
            />
            <BottomSheetInstructionLinkingWallet
                isVisible={enableInstruction}
                closeModalCreateNewWallet={continueActionForSecondSheet}
                continueAction={continueActionForSecondSheet}
                onDismiss={handleHidePinCodeInstruction}
                insets={insets}
                bottomSheetRef={bottomSheetSecondRef}
            />
            {showImportLinking && (
                <ModalLinkingWallet
                    showModalImportWallet={showImportLinking}
                    isScanning={false}
                    handleCancel={() => {
                        setShowImportLinking(false);
                        setErrorValidAddress(false);
                        setContractTonAddress('');
                    }}
                    handleStart={handleCheckProtocolLinkingAction}
                    closeModalImport={() => setShowImportLinking(false)}
                    theme={theme}
                    insets={insets}
                    walletAddressError={errorValidAddress}
                    isFocus={isFocus}
                    onChangeText={handleContractAddress}
                    walletAddress={contractTonAddress}
                    onBlur={onBlur}
                    onFoCus={onFoCus}
                    handleCopyToClipboard={handleCopyToClipboard}
                    loadingLinking={loadingLinking}
                    onShowScanQr={onShowScanQr}
                    newUI={newUI}
                />
            )}
        </>
    );
};

export default ProjectDetailsWrapper;
