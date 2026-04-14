import React from 'react';
import { Pressable, SectionList, Switch, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { ArrowRightSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import settingStyles from './setting.styles';
import { ListSettingType, SettingListType, describe } from './setting.type';

const Separator = () => {
    const theme = useAppTheme();
    const settingStyle = settingStyles(theme);
    return <View style={settingStyle.separator} />;
};

type SwitchViewType = {
    value: boolean;
    onValueChange: (value: boolean) => void;
    theme: AppThemeType;
};

export const SwitchView: React.FC<SwitchViewType> = ({
    value,
    onValueChange,
    theme,
}) => {
    const getColor = (condition: boolean) =>
        condition
            ? appColors.neutral.n400
            : theme.colors.label_surface_button_pressed;
    return (
        <View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{
                    false: appColors.neutral.n400,
                    true: getColor(Utils.isAndroid),
                }}
                thumbColor={Utils.isAndroid ? getColor(value) : undefined}
            />
        </View>
    );
};

const ListSettingScreen: React.FC<ListSettingType> = ({ listScreen }) => {
    const theme = useAppTheme();
    const settingStyle = settingStyles(theme);
    const renderItem = ({
        item,
        index,
        section,
    }: {
        item: describe;
        index: number;
        section: SettingListType;
    }) => {
        const isFirstItem = index === 0;
        const isLastItem = index === section.data.length - 1;

        return (
            <Pressable
                style={[
                    settingStyle.button,
                    isFirstItem ? settingStyle.buttonTop : null,
                    isLastItem ? settingStyle.buttonBottom : null,
                ]}
                onPress={item.onPress}>
                <View
                    style={[
                        settingStyle.flexRow,
                        settingStyle.alignItemsCenter,
                        settingStyle.justifyContentBetween,
                    ]}>
                    <item.icon
                        width={16}
                        height={16}
                        color={theme.colors.text_on_surface_text_medium}
                    />
                    <AppText
                        titleWithI18n={item.title}
                        variant={TextVariantKeys.bodyMMedium}
                        styles={settingStyle.buttonText}
                    />
                    {item.rightView ? (
                        item.rightView
                    ) : (
                        <ArrowRightSvgIcon
                            color={theme.colors.text_on_surface_text_light}
                        />
                    )}
                </View>
            </Pressable>
        );
    };
    return (
        <SectionList
            sections={listScreen}
            keyExtractor={item => item.title}
            ItemSeparatorComponent={Separator}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => {
                return (
                    <AppText
                        titleWithI18n={title}
                        variant={TextVariantKeys.bodyMMedium}
                        styles={settingStyle.titleList}
                    />
                );
            }}
            contentContainerStyle={appStyles.mt10}
        />
    );
};
export { ListSettingScreen, Separator };
