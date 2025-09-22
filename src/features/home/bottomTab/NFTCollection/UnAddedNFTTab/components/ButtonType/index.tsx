import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import UnAddedNFTTypeIcon from 'src/components/specific/UnAddedNFTTypeIcon';
import appColors from 'src/core/constants/AppColors';
import { CheckSvgIcon2 } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { UnAddedType } from 'src/core/enum/UnAddedType';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import styles from './styles';

export type UnAddedButtonType = {
    typeSelect: UnAddedType;
    onPress: () => void;
    type: UnAddedType;
    titleWithI18n: string;
};

export type TypeModalType = {
    closeModal: () => void;
    typeSelect: UnAddedType;
    setTyeSelect: (value: UnAddedType) => void;
};

const TypeUnAddedNFTModal: React.FC<TypeModalType> = ({
    closeModal,
    typeSelect,
    setTyeSelect,
}) => {
    return (
        <View>
            <TypeUnAddedButton
                titleWithI18n={LanguageKey.nft_unadded_all_type}
                typeSelect={typeSelect}
                type={UnAddedType.All}
                onPress={() => {
                    setTyeSelect(UnAddedType.All);
                    closeModal();
                }}
            />
            <TypeUnAddedButton
                titleWithI18n={LanguageKey.nft_unadded_unarchived_type}
                typeSelect={typeSelect}
                type={UnAddedType.UnArchive}
                onPress={() => {
                    setTyeSelect(UnAddedType.UnArchive);
                    closeModal();
                }}
            />
            <TypeUnAddedButton
                titleWithI18n={LanguageKey.nft_unadded_archived_type}
                typeSelect={typeSelect}
                type={UnAddedType.Archived}
                onPress={() => {
                    setTyeSelect(UnAddedType.Archived);
                    closeModal();
                }}
            />
        </View>
    );
};
const TypeUnAddedButton: React.FC<UnAddedButtonType> = ({
    typeSelect,
    onPress,
    type,
    titleWithI18n,
}) => {
    const getCheck = (currenType: UnAddedType) => {
        return typeSelect === currenType ? <CheckSvgIcon2 /> : null;
    };

    return (
        <TouchableOpacity style={styles.typeButtonContainer} onPress={onPress}>
            <UnAddedNFTTypeIcon style={appStyles.mh15} type={type} />
            <AppText
                titleWithI18n={titleWithI18n}
                textColor={appColors.neutral.black}
                variant={TextVariantKeys.labelMedium}
                styles={appStyles.flex1}
            />
            <View style={styles.checkIcon}>{getCheck(type)}</View>
        </TouchableOpacity>
    );
};
export default TypeUnAddedNFTModal;
