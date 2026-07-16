import React, { useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import useStyles from './viewSvg.style';

type ViewSvgType = {
    itemHeight?: number;
    children: React.ReactNode;
    backgroundColor?: string;
    SvgView?: ({
        height,
        backgroundColor,
        width,
    }: {
        height: number;
        backgroundColor: string;
        width: number;
    }) => React.JSX.Element;
    styleContainer?: StyleProp<ViewStyle>;
    styles?: StyleProp<ViewStyle>;
    usingForLoading?: boolean;
};

const ViewSvg: React.FC<ViewSvgType> = props => {
    const theme: AppThemeType = useAppTheme();
    const style = useStyles(theme);
    const {
        SvgView,
        itemHeight,
        children,
        backgroundColor,
        styles,
        styleContainer,
        usingForLoading = false,
    } = props;

    const [widthHeader, setWidthHeader] = useState<number>(Utils.screenWidth);

    const handleLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setWidthHeader(width);
    };
    return (
        <View style={[styleContainer]}>
            {!usingForLoading &&
                SvgView &&
                SvgView({
                    height: itemHeight ?? 40,
                    width: widthHeader,
                    backgroundColor:
                        backgroundColor ?? theme.colors.surface_surface_high,
                })}

            <View style={[style.content, styles]} onLayout={handleLayout}>
                {children}
            </View>

            {usingForLoading &&
                SvgView &&
                SvgView({
                    height: itemHeight ?? 40,
                    width: widthHeader,
                    backgroundColor:
                        backgroundColor ?? theme.colors.surface_surface_high,
                })}
        </View>
    );
};

export default ViewSvg;
