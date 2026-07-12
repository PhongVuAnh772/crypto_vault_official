import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import { ArrowDownSvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import {
    SupportedNativeTokenWithProtocol,
    SupportedTokenItemWithProtocol,
} from 'src/core/redux/slice/customToken/addCustomToken.type';
import { AppThemeType } from 'src/core/type/ThemeType';
import sendComponentStyle from './style';

type CoinLabelType = {
    data?: SupportedTokenItemWithProtocol | SupportedNativeTokenWithProtocol;
    balance: string;
    theme: AppThemeType;
    onPress: () => void;
    disable?: boolean;
};
const TokenLabel = ({
    data,
    balance,
    theme,
    onPress,
    disable,
}: CoinLabelType) => {
    const style = sendComponentStyle(theme);

    return (
        <TouchableOpacity
            activeOpacity={0.5}
            onPress={onPress}
            disabled={disable}>
            <View style={style.tokenLabelContainer}>
                <AppImage
                    uri={data?.logo ?? ''}
                    styleImage={style.imageToken}
                    defaultImage={appImages.logo}
                    skeletonRadius={100}
                />
                <View style={[style.flex1, style.ml12]}>
                    <AppText
                        title={data?.name}
                        variant={TextVariantKeys.titleMedium}
                        textColor="#FFFFFF"
                    />
                    <View style={style.mt5}>
                        <AppText
                            title="Balance"
                            variant={TextVariantKeys.bodyMSmall}
                            textColor="#8894A6"
                        />
                        <AppText
                            title={balance}
                            variant={TextVariantKeys.titleMedium}
                            textColor="#FFFFFF"
                            styles={style.fontWeightBold}
                        />
                    </View>
                </View>
                {!disable && (
                    <View style={style.mR5}>
                        <ArrowDownSvgIcon
                            width={20}
                            height={20}
                            color="#FFFFFF"
                        />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export { TokenLabel };
