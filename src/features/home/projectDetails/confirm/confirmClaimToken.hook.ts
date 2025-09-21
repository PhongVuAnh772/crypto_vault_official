import { StackActions } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppToastType from 'src/core/enum/AppToastType';
import { ClaimTokenTab } from 'src/core/enum/ClaimTokenTab';
import { Feature } from 'src/core/enum/ContactFailedAction';
import { ProtocolType } from 'src/core/enum/ProtocolType';
import Slip0044 from 'src/core/enum/Slip0044';
import ThemeKey from 'src/core/enum/ThemeKey';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    usePolAddressData,
    useProtocolSelected,
    useTonAddressData,
} from 'src/core/redux/slice/account.selector';
import { getThemeMode } from 'src/core/redux/slice/app.slice';
import createContextError from 'src/core/services/ContextError';
import Utils from 'src/core/utils/commonUtils';
import AppErrorUtils from 'src/core/utils/errorUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import { sendContact } from 'src/features/setting/contact/contact.slice';
import { ContactParams } from 'src/features/setting/contact/contact.type';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { handlingErrorFlow } from '../../bottomTab/explore/explore.component';
import {
    getCheckNFTsGottedContainer,
    getDataClaimable,
    getLinkingTonAddressData,
    getStatusLoadingYouGot,
    handleClaimTokenSpecified,
    handleClaimTokenThunk,
    handleGetHistoryClaimData,
    handleGetOwnedNFTsContainer,
} from '../../bottomTab/explore/explore.slice';
import { OwnedNFTType } from '../../bottomTab/explore/explore.type';
import { ClaimDetailProps } from './confirmClaimToken.type';

export const useConfirmClaimToken = ({ navigation }: RootNavigationType) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const dispatch = useAppDispatch();
    const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
    const { t } = useTranslation();
    const dataGetOwned = useAppSelector(getCheckNFTsGottedContainer);
    const statusLoadingYouGot = useAppSelector(getStatusLoadingYouGot);
    const linkingTonAddressData = useAppSelector(getLinkingTonAddressData);
    const polygonWalletAddress = usePolAddressData();
    const [loading, setLoading] = useState(false);
    const [firstLoading, setFirstLoading] = useState(true);
    const [contactLoading, setContactLoading] = useState(false);
    const [totalClaim, setTotalClaim] = useState(0);
    const dataClaimable = useAppSelector(getDataClaimable);
    const [nameContact, setNameContact] = useState('');
    const [emailContact, setEmailContact] = useState('');
    const [inquiryContact, setInquiryContact] = useState('');
    const [contactSupportModal, setContactSupportModal] = useState(false);
    const currentProtocol = useProtocolSelected();
    const currentTonAccount = useTonAddressData();

    const contextSupportClaimTokenError = (
        functionError: string,

        reason: string,
        id?: number,
    ) => {
        const error = createContextError({
            feature: Feature.ClaimToken,
            fileError: `confirmClaimToken.hook.ts (tabs)`,
            functionError: functionError,
            reason: reason,
            protocol: currentProtocol?.symbol ?? ProtocolType.All,
            id: id,
        });
        // Auto log => push error to server
        AppErrorUtils.sendContactWhenError(dispatch, error);
        return error;
    };

    const backAction = () => {
        navigation.goBack();
    };

    const navigateTabAction = () => {
        navigation.goBack();
        navigation.navigate(ClaimTokenTab.HistoryDetail);
    };

    const handleDismissValue = () => {
        setNameContact('');
        setEmailContact('');
        setInquiryContact('');
    };

    const commonBackAction = () => {
        navigation.goBack();
    };
    const onShowContactSupportModal = () => {
        setContactSupportModal(true);
    };

    const onHideContactSupportModal = () => {
        setContactSupportModal(false);
        handleDismissValue();
    };

    const validate = () => {
        if (
            emailContact.trim().length &&
            nameContact.trim().length &&
            inquiryContact.trim().length &&
            Utils.emailValid(emailContact.trim())
        ) {
            return true;
        }
        return false;
    };

    useEffect(() => {
        setFirstLoading(true);
        const getData = async () => {
            try {
                const res = await dispatch(
                    handleGetOwnedNFTsContainer({
                        claimableTokenProjectId: dataClaimable?.project
                            ?._id as string,
                        polygonWalletAddress:
                            currentProtocol?.slip0044 === Slip0044.Ton
                                ? currentTonAccount?.address
                                : polygonWalletAddress,
                        t,
                    }),
                );
                if (handleGetOwnedNFTsContainer.fulfilled.match(res)) {
                    setFirstLoading(false);
                } else {
                    navigation.goBack();
                    Utils.showToast({
                        msg: t(LanguageKey.common_server_busy),
                        type: AppToastType.error,
                    });
                }
            } catch (error: any) {
                console.log('error useConfirmClaimToken', error);
                navigation.goBack();
                contextSupportClaimTokenError(
                    `getData (getOwnedNFTContainer)`,
                    error,
                    149,
                );
                Utils.showToast({
                    msg: t(LanguageKey.common_server_busy),
                    type: AppToastType.error,
                });
            }
        };
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const navigateToClaimDetail = (data: ClaimDetailProps) => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.TransactionClaimDetail, {
                data: data,
            }),
        );
    };

    const getDataClaim = async () => {
        try {
            if (
                dataClaimable &&
                dataClaimable.project &&
                dataClaimable.project._id &&
                polygonWalletAddress
            ) {
                await dispatch(
                    handleClaimTokenSpecified({
                        claimableTokenProjectId: dataClaimable?.project?._id,
                        polygonWalletAddress:
                            currentProtocol?.slip0044 === Slip0044.Ton
                                ? currentTonAccount?.address
                                : polygonWalletAddress,
                        t,
                    }),
                );
            } else {
                handlingErrorFlow(t);
            }
        } catch (error: any) {
            console.log('error getDataClaim', error);
            contextSupportClaimTokenError(`getDataClaim (confirm)`, error, 149);

            handlingErrorFlow(t);
        }
    };

    const handleClaimToken = async () => {
        setLoading(true);
        const nftId = dataGetOwned?.nfts?.map(
            (item: OwnedNFTType) => item?.nftId,
        );
        try {
            if (
                !polygonWalletAddress ||
                !dataClaimable?.project?._id ||
                (nftId && nftId.length === 0) ||
                !nftId
            ) {
                handleClaimError();
                contextSupportClaimTokenError(
                    `handleClaimToken (confirm)`,
                    `missing data polygonWalletAddress, project._id, nftId`,
                    217,
                );
                return;
            }

            const responseClaim = await dispatch(
                handleClaimTokenThunk({
                    polygonWalletAddress:
                        currentProtocol?.slip0044 === Slip0044.Ton
                            ? currentTonAccount?.address
                            : polygonWalletAddress,
                    projectClaimableTokenId: dataClaimable?.project?._id,
                    nftId: nftId,
                }),
            ).unwrap();
            if (
                dataClaimable &&
                dataClaimable.project &&
                dataClaimable.project._id &&
                responseClaim
            ) {
                await Promise.all([
                    dispatch(
                        handleGetHistoryClaimData({
                            walletAddress:
                                currentProtocol?.slip0044 === Slip0044.Ton
                                    ? currentTonAccount?.address
                                    : polygonWalletAddress,
                            claimableTokenProject: dataClaimable?.project?._id,
                        }),
                    ),
                    getDataClaim(),
                ]);
                navigateToClaimDetail(responseClaim);
            } else {
                handleClaimError();
            }
        } catch (error: any) {
            console.log('error handleClaimToken', error);
            handleClaimError();
            contextSupportClaimTokenError(`handleClaimToken`, error, 217);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const postContactSupport = async (params: ContactParams) => {
        dispatch(sendContact(params)).then(data => {
            if (data.payload) {
                setContactSupportModal(false);
                setContactLoading(false);
                setTimeout(() => {
                    Utils.showToast({
                        msg: t(LanguageKey.claim_details_success_contact),
                        type: AppToastType.success,
                    });
                    handleDismissValue();
                }, 500);
            }
        });
    };

    const onSubmit = () => {
        if (validate()) {
            setContactLoading(true);
            postContactSupport({
                email: emailContact,
                inquiry: inquiryContact,
                name: nameContact,
            });
        }
    };

    const actionSubmitContacting = () => {};

    const handleClaimError = () => {
        Utils.showToast({
            msg: t(LanguageKey.claim_token_error_status),
            type: AppToastType.error,
        });
    };

    return {
        theme,
        backAction,
        lightMode,
        dataClaimable,
        dataGetOwned,
        statusLoadingYouGot,
        commonBackAction,
        handleClaimToken,
        loading,
        totalClaim,
        setTotalClaim,
        nameContact,
        setNameContact,
        emailContact,
        setEmailContact,
        inquiryContact,
        setInquiryContact,
        contactSupportModal,
        onShowContactSupportModal,
        onHideContactSupportModal,
        t,
        navigateToClaimDetail,
        actionSubmitContacting,
        validate,
        onSubmit,
        contactLoading,
        insets,
        firstLoading,
        navigateTabAction,
        linkingTonAddressData,
        currentTonAccount,
        newUI,
    };
};
