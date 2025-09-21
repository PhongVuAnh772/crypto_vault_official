import React, { ReactNode } from 'react';
import { View } from 'react-native';
import AppButton from 'src/components/common/AppButton';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';
import styles from './styles';

type HomeButtonWithTitleType = {
    onPress?: () => void;
    icon: ReactNode;
    titleWithI18n: string;
};

const HomeButtonWithTitle: React.FC<HomeButtonWithTitleType> = props => {
    const { onPress, icon, titleWithI18n } = props;
    const theme = useAppTheme();

    return (
        <View style={[appStyles.center]}>
            <AppButton
                onPress={onPress}
                icon={icon}
                forceStyles={
                    GlobalUtils.getEnableRedXNewTheme()
                        ? undefined
                        : [
                              styles.buttonAction,
                              {
                                  backgroundColor:
                                      theme.colors.surface_surface__medium,
                              },
                          ]
                }
            />
            <AppText
                titleWithI18n={titleWithI18n}
                variant={TextVariantKeys.labelTiny}
                textColor={theme.colors.text_on_surface_text_high}
                styles={{
                    marginTop: GlobalUtils.getEnableRedXNewTheme() ? 4 : 0,
                }}
            />
        </View>
    );
};

export default HomeButtonWithTitle;
