import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ButtonSvg = ({
    height,
    backgroundColor,
    width,
    borderColor,
    borderWidth,
}: {
    height: number;
    backgroundColor: string;
    width: number;
    borderColor?: string;
    borderWidth?: number;
}) => {
    return (
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <Path
                d={`M0,${height / 2}  L${height / 2},0 L${width},0 L${width},${height / 2} L${width - height / 2},${height} L0,${height}  Z`}
                fill={backgroundColor}
                stroke={borderColor}
                strokeWidth={borderWidth}
            />
        </Svg>
    );
};

const ButtonCustomSvg = ({
    height,
    backgroundColor,
    width,
    borderColor,
    borderWidth,
}: {
    height: number;
    backgroundColor: string;
    width: number;
    borderColor?: string;
    borderWidth?: number;
}) => {
    return (
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <Path
                d={`M0,${height / 3.2}  L${height / 3.2},0 L${width},0 L${width},${height / 1.4} L${width - height / 3.2},${height} L0,${height}  Z`}
                fill={backgroundColor}
                stroke={borderColor}
                strokeWidth={borderWidth}
            />
        </Svg>
    );
};
const ViewSvg = ({
    height,
    backgroundColor,
    widthView,
}: {
    height: number;
    backgroundColor: string;
    widthView: number;
}) => {
    return (
        <Svg
            width="100%"
            height={height}
            viewBox={`0 0 ${widthView} ${height}`}>
            <Path
                d={`M0,${height / 2}  L${height / 3},0 L${widthView - height / 3},0 L${widthView},${height / 2} L${widthView - height / 3},${height} L${height / 3},${height}`}
                fill={backgroundColor}
            />
        </Svg>
    );
};
const ViewHomeSvg = ({
    height,
    backgroundColor,
    width,
}: {
    height: number;
    backgroundColor: string;
    width: number;
}) => {
    const padding = 5;
    const paddingShadow = 6.5;
    const margin = 3;

    return (
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <Path
                d={`M${margin},${height / 10 + margin / 2}  L${height / 10 + margin / 2},${margin} L${width - margin},${margin} L${width - margin},${height - height / 10 - margin / 2} L${width - height / 10 - margin / 2},${height - margin} L${margin},${height - margin}  Z`}
                fill={'transparent'}
                stroke={'white'}
                strokeWidth={5}
            />

            <Path
                d={`M${padding},${height / 10 + padding / 2}  L${height / 10 + padding / 2},${padding} L${width - padding},${padding} L${width - padding},${height - height / 10 - padding / 2} L${width - height / 10 - padding / 2},${height - padding} L${padding},${height - padding}  Z`}
                fill={backgroundColor}
                stroke={'red'}
                strokeWidth={2}
                opacity={0.9}
            />
            <Path
                d={`M${paddingShadow},${height / 10 + paddingShadow / 2}  L${height / 10 + paddingShadow / 2},${paddingShadow} L${width - paddingShadow},${paddingShadow} L${width - paddingShadow},${height - height / 10 - paddingShadow / 2} L${width - height / 10 - paddingShadow / 2},${height - paddingShadow} L${paddingShadow},${height - paddingShadow}  Z`}
                fill={'transparent'}
                stroke={'rgba(255, 0, 0, 0.1);'}
                strokeWidth={4}
            />
        </Svg>
    );
};
const ViewCryptoSvg = ({
    height,
    backgroundColor,
    width,
}: {
    height: number;
    backgroundColor: string;
    width: number;
}) => {
    const padding = 5;
    const margin = 3;
    return (
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <Path
                d={`M${margin},${margin}  L${width - width / 15 - margin / 2},${margin} L${width - margin},${width / 15}L${width - margin},${height - margin} L${width - height / 10 - margin / 2},${height - margin} L${width / 15},${height - margin} L${margin},${height - width / 15}  Z`}
                fill={'transparent'}
                stroke={'white'}
                strokeWidth={5}
            />
            <Svg
                width="100%"
                height={height}
                viewBox={`0 0 ${width} ${height}`}>
                <Path
                    d={`M${padding},${padding}  L${width - width / 15 - padding / 2},${padding} L${width - padding},${width / 15}L${width - padding},${height - padding} L${width - height / 10 - padding / 2},${height - padding} L${width / 15},${height - padding} L${padding},${height - width / 15}  Z`}
                    fill={'white'}
                    stroke={'red'}
                    strokeWidth={2}
                    opacity={0.9}
                />
            </Svg>
        </Svg>
    );
};
const ViewHomeHeaderSvg = ({
    height,
    backgroundColor,
    width,
}: {
    height: number;
    backgroundColor: string;
    width: number;
}) => {
    const padding = 5;
    const paddingShadow = 6.5;
    const margin = 3;
    return (
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <Path
                d={`M${margin},${height / 10 + margin / 2}  L${height / 10 + margin / 2},${margin} L${width - margin},${margin} L${width - margin},${height - height / 10 - margin / 2} L${width - height / 10 - margin / 2},${height - margin} L${margin},${height - margin}  Z`}
                fill={'transparent'}
                stroke={'white'}
                strokeWidth={5}
            />

            <Path
                d={`M${padding},${height / 10 + padding / 2}  L${height / 10 + padding / 2},${padding} L${width - padding},${padding} L${width - padding},${height - height / 10 - padding / 2} L${width - height / 10 - padding / 2},${height - padding} L${padding},${height - padding}  Z`}
                fill={backgroundColor}
                stroke={'red'}
                strokeWidth={2}
                opacity={0.9}
            />
            <Path
                d={`M${paddingShadow},${height / 10 + paddingShadow / 2}  L${height / 10 + paddingShadow / 2},${paddingShadow} L${width - paddingShadow},${paddingShadow} L${width - paddingShadow},${height - height / 10 - paddingShadow / 2} L${width - height / 10 - paddingShadow / 2},${height - paddingShadow} L${paddingShadow},${height - paddingShadow}  Z`}
                fill={'transparent'}
                stroke={'rgba(255, 0, 0, 0.1);'}
                strokeWidth={4}
            />
        </Svg>
    );
};
const SvgView = {
    button: ButtonSvg,
    view: ViewSvg,
    viewHome: ViewHomeSvg,
    viewCrypto: ViewCryptoSvg,
    viewHeaderHome: ViewHomeHeaderSvg,
    ButtonCustomSvg: ButtonCustomSvg,
};

export default SvgView;
