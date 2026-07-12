import React from 'react';
import { StyleSheet } from 'react-native';
import { DangerSvgIcon } from 'src/core/constants/AppIconsSvg';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    getShowCommonErrorModal,
    setActionFailedNeedToContact,
    setShowCommonErrorModal,
} from 'src/core/redux/slice/app.slice';
import { AppThemeType } from 'src/core/type/ThemeType';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { rootNavigate } from 'src/navigation/stacks/type/RootParamListType';
import AppModal from '../common/AppModal';

const CommonErrorModal = () => {
    const theme = useAppTheme();
    const dispatch = useAppDispatch();
    const showCommonErrorModal = useAppSelector(getShowCommonErrorModal);
    const closeModal = () => {
        dispatch(setShowCommonErrorModal(false));
        dispatch(setActionFailedNeedToContact(''));
    };
    const commonCloseModal = () => {
        dispatch(setShowCommonErrorModal(false));
    };
    const goToContact = () => {
        commonCloseModal();
        rootNavigate(HomeStackScreenKey.Contact, {});
    };
    const styles = useStyles(theme);
    return (
        <AppModal
            titleWithI18n={LanguageKey.common_text_error_title}
            subTitleWithI18n={LanguageKey.common_text_error_sub_title}
            visible={showCommonErrorModal}
            onPress={goToContact}
            buttonTitleWithI18n={LanguageKey.setting_contact_support}
            twoOptionsVertical={true}
            buttonTitleWithI18n2={LanguageKey.cancel}
            onPress2={closeModal}
            icon={<DangerSvgIcon />}
            button2Styles={styles.buttonCancel}
            textButtonSecondColor={theme.colors.text_on_surface_text_brand_2}
        />
    );
};

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        buttonCancel: {
            borderWidth: 1,
            borderColor: theme.colors.text_on_surface_text_brand_2,
        },
    });

export default CommonErrorModal;
