import { StackActions } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import AppToastType from 'src/core/enum/AppToastType';
import ThemeKey from 'src/core/enum/ThemeKey';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { getThemeMode } from 'src/core/redux/slice/app.slice';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import { sendContact } from 'src/features/setting/contact/contact.slice';
import { ContactParams } from 'src/features/setting/contact/contact.type';
import {
    getCheckNFTsGottedContainer,
    getDataClaimable,
    getStatusLoadingYouGot,
    setTabIndex,
} from '../../bottomTab/explore/explore.slice';
import { TransactionClaimDetailProps } from './transactionDetails.type';

export const useTransactionClaimDetails = ({
    navigation,
    data,
}: TransactionClaimDetailProps) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const theme = useAppTheme();
    const dispatch = useAppDispatch();
    const insets = useAppSafeAreaInsets();
    const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
    const { t } = useTranslation();
    const dataGetOwned = useAppSelector(getCheckNFTsGottedContainer);
    const statusLoadingYouGot = useAppSelector(getStatusLoadingYouGot);

    const [totalClaim, setTotalClaim] = useState(0);
    const dataClaimable = useAppSelector(getDataClaimable);
    const [nameContact, setNameContact] = useState('');
    const [emailContact, setEmailContact] = useState('');
    const [inquiryContact, setInquiryContact] = useState('');
    const [contactSupportModal, setContactSupportModal] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);

    const backAction = () => {
        navigation.dispatch(StackActions.pop(2));
        dispatch(setTabIndex(1));
    };

    const onViewOnScan = () => {
        Linking.openURL(
            `${dataClaimable?.projectTokenProtocol?.transactionScanURL ?? ''}${data?.transactionHash}`,
        );
    };

    const commonBackAction = () => {
        navigation.goBack();
    };

    const onShowContactSupportModal = () => {
        setContactSupportModal(true);
    };

    const handleCopy = async () => {
        await Clipboard.setStringAsync(data?.transactionHash);
        Utils.showToast({
            msg: t(LanguageKey.common_copied),
            type: AppToastType.success,
        });
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

    const handleDismissValue = () => {
        setNameContact('');
        setEmailContact('');
        setInquiryContact('');
    };

    const onHideContactSupportModal = () => {
        setContactSupportModal(false);
        handleDismissValue();
    };

    return {
        theme,
        backAction,
        lightMode,
        dataClaimable,
        dataGetOwned,
        statusLoadingYouGot,
        commonBackAction,
        totalClaim,
        setTotalClaim,
        handleCopy,
        onViewOnScan,
        insets,
        onShowContactSupportModal,
        contactSupportModal,
        nameContact,
        setNameContact,
        emailContact,
        setEmailContact,
        inquiryContact,
        setInquiryContact,
        onHideContactSupportModal,
        onSubmit,
        validate,
        contactLoading,
        newUI,
    };
};
