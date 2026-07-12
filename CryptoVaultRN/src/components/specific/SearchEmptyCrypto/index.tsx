import React from 'react';
import { StyleProp, View, ViewStyle, TouchableOpacity, StyleSheet } from 'react-native';
import AppText from 'src/components/common/AppText';
import { 
    NotFoundSvgIcon, 
    PlusSvgIcon, 
    DocumentSvgIcon, 
    QuestionSvgIcon, 
    ArrowRight2SvgIcon,
    StarSvgIcon
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';

type SearchEmptyType = {
    styles?: StyleProp<ViewStyle>;
    onPressAdd?: () => void;
};

const SearchEmptyCrypto: React.FC<SearchEmptyType> = ({ styles, onPressAdd }) => {
    const theme = useAppTheme();

    return (
        <View style={[styles, style.container]}>
            {/* Illustration Area */}
            <View style={style.illustrationWrapper}>
                <View style={style.circleBg}>
                    <NotFoundSvgIcon
                        width={60}
                        height={60}
                        color="#5B63E4"
                    />
                </View>
                {/* Floating Stars */}
                <View style={[style.star, style.starTopLeft]}>
                    <StarSvgIcon width={14} height={14} color="#C7D2FE" />
                </View>
                <View style={[style.star, style.starTopRight]}>
                    <StarSvgIcon width={10} height={10} color="#C7D2FE" />
                </View>
                <View style={[style.star, style.starMiddleLeft]}>
                    <StarSvgIcon width={10} height={10} color="#C7D2FE" />
                </View>
                <View style={[style.star, style.starBottomRight]}>
                    <StarSvgIcon width={12} height={12} color="#C7D2FE" />
                </View>
            </View>

            {/* Title & Subtitle */}
            <View style={style.textWrapper}>
                <AppText
                    title="Không tìm thấy tài sản"
                    variant={TextVariantKeys.titleLarge}
                    textColor="#0A0D14"
                    styles={style.emptyTitle}
                />
                <AppText
                    title="Xin lỗi, chúng tôi không tìm thấy token nào phù hợp với tìm kiếm của bạn."
                    variant={TextVariantKeys.bodyRMedium}
                    textColor="#7C8099"
                    styles={style.emptySubtitle}
                />
            </View>

            {/* Help Card */}
            <View style={style.helpCard}>
                <TouchableOpacity 
                    activeOpacity={0.6}
                    onPress={onPressAdd}
                    style={style.helpItem}
                >
                    <View style={style.iconSquircle}>
                        <PlusSvgIcon width={18} height={18} color="#5B63E4" />
                    </View>
                    <View style={style.helpTextContainer}>
                        <AppText
                            title="Thêm token tùy chỉnh"
                            variant={TextVariantKeys.bodyMMedium}
                            textColor="#0A0D14"
                            styles={style.helpTitle}
                        />
                        <AppText
                            title="Thêm token theo hợp đồng để quản lý tài sản của bạn."
                            variant={TextVariantKeys.bodyRSmall}
                            textColor="#7C8099"
                            styles={style.helpSubtitle}
                        />
                    </View>
                    <ArrowRight2SvgIcon width={18} height={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={style.divider} />

                <View style={style.helpItem}>
                    <View style={style.iconSquircle}>
                        <DocumentSvgIcon width={18} height={18} color="#5B63E4" />
                    </View>
                    <View style={style.helpTextContainer}>
                        <AppText
                            title="Nhập thông tin chính xác"
                            variant={TextVariantKeys.bodyMMedium}
                            textColor="#0A0D14"
                            styles={style.helpTitle}
                        />
                        <AppText
                            title="Vui lòng kiểm tra kỹ địa chỉ hợp đồng và thông tin token."
                            variant={TextVariantKeys.bodyRSmall}
                            textColor="#7C8099"
                            styles={style.helpSubtitle}
                        />
                    </View>
                    <ArrowRight2SvgIcon width={18} height={18} color="#9CA3AF" />
                </View>

                <View style={style.divider} />

                <View style={style.helpItem}>
                    <View style={style.iconSquircle}>
                        <QuestionSvgIcon width={18} height={18} color="#5B63E4" />
                    </View>
                    <View style={style.helpTextContainer}>
                        <AppText
                            title="Không chắc chắn?"
                            variant={TextVariantKeys.bodyMMedium}
                            textColor="#0A0D14"
                            styles={style.helpTitle}
                        />
                        <AppText
                            title="Tìm hiểu thêm về token và địa chỉ hợp đồng."
                            variant={TextVariantKeys.bodyRSmall}
                            textColor="#7C8099"
                            styles={style.helpSubtitle}
                        />
                    </View>
                    <ArrowRight2SvgIcon width={18} height={18} color="#9CA3AF" />
                </View>
            </View>
        </View>
    );
};

const style = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 20,
    },
    illustrationWrapper: {
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    circleBg: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    star: {
        position: 'absolute',
    },
    starTopLeft: {
        top: 25,
        left: 20,
    },
    starTopRight: {
        top: 30,
        right: 25,
    },
    starMiddleLeft: {
        bottom: 45,
        left: 15,
    },
    starBottomRight: {
        bottom: 40,
        right: 20,
    },
    textWrapper: {
        alignItems: 'center',
        marginTop: 15,
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontFamily: mPlus1.bold,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    emptySubtitle: {
        fontFamily: mPlus1.medium,
        fontSize: 13,
        color: '#7C8099',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 18,
    },
    helpCard: {
        alignSelf: 'stretch',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 20,
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#EEF2FF',
        shadowColor: '#5B63E4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    helpItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    iconSquircle: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    helpTextContainer: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    helpTitle: {
        fontFamily: mPlus1.bold,
        fontSize: 14,
        fontWeight: '700',
    },
    helpSubtitle: {
        fontFamily: mPlus1.medium,
        fontSize: 11,
        color: '#7C8099',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEF2FF',
        marginVertical: 6,
    },
});

export default SearchEmptyCrypto;
