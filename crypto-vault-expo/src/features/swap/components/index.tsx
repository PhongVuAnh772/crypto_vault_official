import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { MotiSkeletonProps } from 'moti/build/skeleton/types';
import React, { useState } from 'react';
import { ScrollView, TouchableHighlight, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SvgUri } from 'react-native-svg';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppImage from 'src/components/common/AppImage';
import { LoadingImage } from 'src/components/common/AppImage/type';
import AppSkeletonLoading from 'src/components/common/AppSkeletonLoading';
import AppText from 'src/components/common/AppText';
import AppTextInput from 'src/components/common/AppTextInput';
import WalletItem from 'src/components/homeComponents/WalletItem';
import BottomSheetProtocolView from 'src/components/layout/BottomSheetProtocol';
import RNCustomInput from 'src/components/layout/SearchInput';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import SeparatorLine from 'src/components/specific/SeparatorLine';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import {
    ArrowRightSvgIcon,
    Close2SvgIcon,
    Danger2SvgIcon,
    DeleteTextSvgIcon,
    DropdowSvgIcon,
    EmptyTransactionSvgIcon,
    InfoSvgIcon,
    MarkSvgIcon,
    SearchSvgIcon,
    SendDownSvgIcon,
    SwapDynamicSvgIcon,
    SwapSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import commonUtils from 'src/core/utils/commonUtils';
import DateTimeUtils from 'src/core/utils/dateTimeUtils';
import walletUtils from 'src/core/utils/walletUtils';
import {
    getAmount,
    getAmountColorByStatus,
    getBackgroundColorByStatus,
    getSymbol,
    getTextByStatus,
    getTextColorByStatus,
} from '../index.utils';
import {
    HeaderListProps,
    SwapHistoryProps,
} from '../swapHistory/swapHistory.type';
import styles from './styles';
import {
    ConfirmationInfoBoxProps,
    CurrenciesBottomSheetProps,
    CurrencyItemProps,
    MinimalExchangeAmountViewProps,
    ProtocolListBottomSheetProps,
    RatePreviewProps,
    RowProps,
    SwapBoxProps,
    SwapConfirmationBottomSheetProps,
    WalletBottomSheetProps,
} from './types';

const _borderRadius = 4;

export const SwapBox: React.FC<SwapBoxProps> = ({
    title,
    onPressProtocol,
    logoProtocol,
    protocolName,
    tokenName,
    tokenLogo,
    balanceText,
    currencyText,
    onChangeText,
    value,
    disabledInput,
    onPressToken,
    i18nParamsBalance,
    disableSendMax = true,
    onPressSendMax,
    walletName,
    onShowWalletManagement,
    onShowBalanceInfo,
    isShowBalanceInfo = false,
}) => {
    return (
        <>
            <View style={styles.titleInfoContainer}>
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.alignItemsCenter,
                        appStyles.flex1,
                        styles.gap5,
                    ]}>
                    <AppText
                        titleWithI18n={title}
                        textColor={appColors.neutral.white}
                        variant={TextVariantKeys.labelMedium}
                    />
                    <TouchableOpacity
                        onPress={onShowWalletManagement}
                        style={styles.walletButtonContainer}>
                        <>
                            <AppText
                                title={walletUtils.getShortAddress(walletName)}
                                textColor={appColors.neutral.n200}
                                variant={TextVariantKeys.labelSmall}
                            />
                            <DropdowSvgIcon
                                color={appColors.neutral.n200}
                                width={17}
                                height={17}
                            />
                        </>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={onPressProtocol}
                    style={[styles.protocolButtonContainer, appStyles.flex1]}>
                    <>
                        <AppImage
                            uri={logoProtocol}
                            styleImage={appStyles.iconCircleSize18}
                        />
                        <AppText
                            title={protocolName.toUpperCase()}
                            textColor={appColors.neutral.n200}
                            variant={TextVariantKeys.labelSmall}
                        />
                        <DropdowSvgIcon
                            color={appColors.neutral.n200}
                            width={17}
                            height={17}
                        />
                    </>
                </TouchableOpacity>
            </View>
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.alignItemsCenter,
                    appStyles.justifyContentBetween,
                    styles.content,
                ]}>
                <View style={[appStyles.flex3, styles.gap5]}>
                    <View
                        style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                        <View style={appStyles.iconCircleSize32}>
                            <SvgUri width={32} height={32} uri={tokenLogo} />
                        </View>

                        <TouchableOpacity
                            onPress={onPressToken}
                            style={[
                                appStyles.flexRow,
                                appStyles.pH10,
                                appStyles.alignItemsCenter,
                            ]}>
                            <AppText
                                title={commonUtils
                                    .truncateText(tokenName, 7)
                                    .toUpperCase()}
                                textColor={appColors.neutral.n800}
                                variant={TextVariantKeys.labelMedium}
                            />
                            <ArrowRightSvgIcon
                                color={appColors.neutral.black}
                                width={24}
                                height={24}
                            />
                        </TouchableOpacity>
                        {disableSendMax ? null : (
                            <TouchableOpacity onPress={onPressSendMax}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_max}
                                    textColor={appColors.main.tokyoRed}
                                    variant={TextVariantKeys.bodyMMedium}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View>
                        <TouchableOpacity
                            style={[
                                appStyles.flexRow,
                                appStyles.alignItemsCenter,
                                styles.gap5,
                            ]}
                            onPress={() => {
                                if (isShowBalanceInfo && onShowBalanceInfo) {
                                    onShowBalanceInfo();
                                }
                            }}
                            disabled={!isShowBalanceInfo}>
                            <View>
                                <AppText
                                    titleWithI18n={balanceText}
                                    textColor={appColors.neutral.n500}
                                    variant={TextVariantKeys.bodyRTiny}
                                    styles={styles.balanceText}
                                    i18nParam={i18nParamsBalance}
                                />
                            </View>

                            {isShowBalanceInfo && (
                                <InfoSvgIcon
                                    color={appColors.neutral.n500}
                                    width={18}
                                    height={18}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[appStyles.flex2, styles.gap5]}>
                    <AppTextInput
                        styleTextInput={[
                            styles.inputContainer,
                            {
                                color: !disabledInput
                                    ? appColors.neutral.black
                                    : appColors.neutral.n500,
                            },
                        ]}
                        placeholder="0"
                        numberOfLines={1}
                        onChangeText={onChangeText}
                        value={value}
                        editable={!disabledInput}
                        keyboardType="numeric"
                    />
                    <AppText
                        title={currencyText}
                        textColor={appColors.neutral.n500}
                        variant={TextVariantKeys.bodyMSmall}
                        styles={appStyles.alignSelfEnd}
                    />
                </View>
            </View>
        </>
    );
};

export const ProtocolListBottomSheet: React.FC<
    ProtocolListBottomSheetProps
> = ({
    refModal,
    onCloseModalProtocol,
    protocolList,
    selectedProtocolId,
    handlePressProtocol,
}) => {
    const [isLoadingImages, setIsLoadingImages] = useState<LoadingImage>({});
    const setLoadingImages = (uri: string, value: boolean) => {
        const imageLoading = isLoadingImages[uri];
        if (!imageLoading || imageLoading.loading) {
            setIsLoadingImages(prev => {
                return {
                    ...prev,
                    [uri]: {
                        uri: uri,
                        loading: value,
                    },
                };
            });
        }
    };
    return (
        <BottomSheetModalGorhom
            refModal={refModal}
            containerStyles={styles.protocolContainer}>
            <BottomSheetProtocolView
                onCloseModalProtocol={onCloseModalProtocol}
                protocolDataLists={protocolList}
                selectedProtocolId={selectedProtocolId}
                handlePressProtocol={handlePressProtocol}
                isLoadingImages={isLoadingImages}
                setLoadingImages={setLoadingImages}
                refreshList={false}
                onRefresh={() => {}}
            />
        </BottomSheetModalGorhom>
    );
};

export const CurrenciesBottomSheet: React.FC<CurrenciesBottomSheetProps> = ({
    refModal,
    currencies,
    currencySelected,
    onPressCurrency,
    onClose,
    searchCrypto,
    onChangeSearchCrypto,
}) => {
    const inset = useAppSafeAreaInsets();
    return (
        <BottomSheetModalGorhom
            snapPoints={['90']}
            refModal={refModal}
            enableContentPanningGesture={true}
            scrollEnable={false}
            containerStyles={styles.protocolContainer}>
            <View style={[appStyles.pH25, appStyles.pB15]}>
                <TouchableOpacity
                    onPress={onClose}
                    style={appStyles.alignSelfEnd}>
                    <Close2SvgIcon color={appColors.neutral.black} />
                </TouchableOpacity>
                <AppText
                    titleWithI18n={LanguageKey.swap_select_a_crypto}
                    variant={TextVariantKeys.titleLarge}
                    styles={[appStyles.textAlignCenter, appStyles.pB15]}
                />
                <RNCustomInput
                    placeholder={LanguageKey.search_crypto_title}
                    value={searchCrypto}
                    containerStyle={styles.inputSearch}
                    setValue={onChangeSearchCrypto}
                    keyboardType="default"
                    leftIcon={<SearchSvgIcon color={appColors.neutral.black} />}
                    secureTextEntry={false}
                    RightIcon={
                        searchCrypto !== '' && (
                            <TouchableOpacity
                                onPress={() => onChangeSearchCrypto('')}>
                                <DeleteTextSvgIcon />
                            </TouchableOpacity>
                        )
                    }
                />
            </View>
            <BottomSheetFlatList
                data={currencies}
                keyExtractor={item => item.name + item.ticker + item.image}
                renderItem={({ item }) => {
                    return (
                        <CurrencyItem
                            item={item}
                            isSelected={
                                currencySelected?.ticker === item.ticker &&
                                currencySelected?.network === item.network
                            }
                            onPress={() => onPressCurrency(item)}
                        />
                    );
                }}
                contentContainerStyle={[
                    appStyles.pH25,
                    { paddingBottom: inset.bottom },
                ]}
                initialNumToRender={10}
                ItemSeparatorComponent={SeparatorLine}
            />
        </BottomSheetModalGorhom>
    );
};

const CurrencyItem: React.FC<CurrencyItemProps> = ({
    item,
    isSelected,
    onPress,
}) => {
    return (
        <TouchableHighlight
            activeOpacity={0.9}
            underlayColor={appColors.neutral.n200}
            onPress={onPress}
            style={[
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                appStyles.justifyContentBetween,
                styles.p16,
                appStyles.backgroundWhite,
            ]}>
            <>
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.alignItemsCenter,
                        styles.gap10,
                        appStyles.flex3,
                    ]}>
                    <View style={appStyles.iconCircleSize28}>
                        <SvgUri width={28} height={28} uri={item.image} />
                    </View>
                    <AppText
                        title={commonUtils.truncateText(item.name, 17)}
                        variant={TextVariantKeys.titleMedium}
                        numberOfLines={1}
                    />
                    <View style={styles.shortCurrencyContainer}>
                        <AppText
                            title={item.ticker.toUpperCase()}
                            variant={TextVariantKeys.labelTiny}
                        />
                    </View>
                </View>
                <View style={[appStyles.flex1, appStyles.alignItemsEnd]}>
                    {isSelected && (
                        <MarkSvgIcon
                            width="16"
                            height="16"
                            color={appColors.functional.green}
                        />
                    )}
                </View>
            </>
        </TouchableHighlight>
    );
};

export const MinimalExchangeAmountView: React.FC<
    MinimalExchangeAmountViewProps
> = ({ minimum, symbol }) => {
    if (!minimum) return null;
    return (
        <Animated.View
            style={[
                appStyles.alignItemsCenter,
                appStyles.flexRow,
                appStyles.justifyContentCenter,
                styles.gap10,
                appStyles.pT10,
            ]}
            entering={FadeIn.duration(200)}>
            <Danger2SvgIcon
                width={24}
                height={24}
                color={appColors.neutral.white}
            />
            <AppText
                titleWithI18n={LanguageKey.swap_minimum_amount_is}
                variant={TextVariantKeys.bodyMMedium}
                textColor={appColors.neutral.white}
                i18nParam={{
                    amount: minimum,
                    symbol,
                }}
            />
        </Animated.View>
    );
};

export const SwapConfirmationBottomSheet: React.FC<
    SwapConfirmationBottomSheetProps
> = ({
    refModal,
    onCloseModal,
    youSend,
    youGet,
    forecast,
    networkFee,
    totalAmount,
    onConfirm,
    isLoading,
}) => {
    const inset = useAppSafeAreaInsets();
    return (
        <BottomSheetModalGorhom
            snapPoints={['80']}
            refModal={refModal}
            pressBehavior="none"
            enablePanDownToClose={false}
            containerStyles={styles.protocolContainer}>
            <ScrollView contentContainerStyle={[appStyles.pH25]}>
                <View style={appStyles.pB15}>
                    <TouchableOpacity
                        onPress={onCloseModal}
                        style={appStyles.alignSelfEnd}>
                        <Close2SvgIcon color={appColors.neutral.black} />
                    </TouchableOpacity>
                    <AppText
                        titleWithI18n={LanguageKey.common_text_confirmation}
                        variant={TextVariantKeys.titleLarge}
                        styles={appStyles.textAlignCenter}
                    />
                </View>
                <ConfirmationInfoBox
                    amount={youSend.amount}
                    amountFollowCurrency={youSend.amountFollowCurrency}
                    logo={youSend.logo}
                    title={LanguageKey.common_text_from}
                    walletAddress={youSend.walletAddress}
                />
                <View style={[appStyles.mv15, appStyles.alignItemsCenter]}>
                    <SendDownSvgIcon />
                </View>
                <ConfirmationInfoBox
                    amount={youGet.amount}
                    amountFollowCurrency={youGet.amountFollowCurrency}
                    logo={youGet.logo}
                    title={LanguageKey.common_text_to}
                    walletAddress={youGet.walletAddress}
                />
                <View style={[styles.gap10, appStyles.mt15]}>
                    <Row title={LanguageKey.swap_forecast} value={forecast} />
                    <Row
                        title={LanguageKey.send_network_fee_title}
                        value={networkFee}
                    />
                </View>
                <View style={appStyles.pV15}>
                    <SeparatorLine />
                </View>
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.alignItemsCenter,
                        appStyles.justifyContentBetween,
                    ]}>
                    <AppText
                        titleWithI18n={
                            LanguageKey.transaction_detail_total_amount
                        }
                        variant={TextVariantKeys.bodyMLarge}
                        textColor={appColors.neutral.n600}
                        styles={appStyles.flex1}
                    />

                    <AppText
                        title={totalAmount}
                        variant={TextVariantKeys.titleMedium}
                        textColor={appColors.main.tokyoRed}
                        styles={[appStyles.flex1, appStyles.textAlignRight]}
                    />
                </View>
            </ScrollView>
            <View
                style={[
                    appStyles.pH25,
                    appStyles.pT10,
                    { paddingBottom: inset.bottom },
                ]}>
                <AppButtonSVG
                    onPress={onConfirm}
                    titleWithI18n={LanguageKey.common_text_confirm}
                    textVariant={TextVariantKeys.bodyMMedium}
                    textColor={appColors.neutral.white}
                    backgroundColor={appColors.main.tokyoRed}
                    SvgView={SvgView.button}
                    buttonHeight={48}
                    isLoading={isLoading}
                />
            </View>
        </BottomSheetModalGorhom>
    );
};

const ConfirmationInfoBox: React.FC<ConfirmationInfoBoxProps> = ({
    amount,
    amountFollowCurrency,
    logo,
    title,
    walletAddress,
}) => {
    return (
        <View style={styles.containerBox}>
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                ]}>
                <View style={styles.titleBox}>
                    <AppText
                        titleWithI18n={title}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.n500}
                    />
                </View>
                <AppText
                    titleWithI18n={walletUtils.getShortAddress(walletAddress)}
                    variant={TextVariantKeys.titleSmall}
                    textColor={appColors.neutral.n800}
                />
            </View>
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.mt15,
                    appStyles.alignItemsCenter,
                ]}>
                <View style={[appStyles.flex3, styles.gap5]}>
                    <AppText
                        title={amount}
                        variant={TextVariantKeys.titleMedium}
                        textColor={appColors.neutral.n800}
                    />

                    <AppText
                        title={amountFollowCurrency}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor={appColors.neutral.n500}
                    />
                </View>
                <View style={[appStyles.flex1, appStyles.alignItemsEnd]}>
                    <View style={appStyles.iconCircleSize32}>
                        <SvgUri width={32} height={32} uri={logo} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const Row: React.FC<RowProps> = ({ title, value }) => {
    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                appStyles.justifyContentBetween,
                appStyles.mt20,
            ]}>
            <AppText
                titleWithI18n={title}
                variant={TextVariantKeys.bodyMMedium}
                textColor={appColors.neutral.n500}
                styles={appStyles.flex1}
            />

            <AppText
                title={value}
                variant={TextVariantKeys.bodyMMedium}
                textColor={appColors.neutral.n800}
                styles={[appStyles.flex1, appStyles.textAlignRight]}
            />
        </View>
    );
};

export const RatePreview: React.FC<RatePreviewProps> = ({ rate }) => {
    if (!rate) {
        return null;
    }
    return (
        <Animated.View
            style={[
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                appStyles.justifyContentBetween,
                styles.containerBox,
                appStyles.mt20,
                appStyles.pv12,
            ]}
            entering={FadeIn.duration(200)}>
            <AppText
                titleWithI18n={LanguageKey.swap_estimate_rate}
                styles={appStyles.textAlignLeft}
                variant={TextVariantKeys.bodyMMedium}
                textColor={appColors.neutral.n500}
            />
            <AppText
                title={rate}
                variant={TextVariantKeys.bodyMMedium}
                textColor={appColors.neutral.n800}
                styles={appStyles.textAlignRight}
            />
        </Animated.View>
    );
};

export const LoadingSwapView: React.FC = () => {
    return (
        <Animated.View
            style={[appStyles.pH25, appStyles.mt12]}
            exiting={FadeOut.duration(500)}>
            <SwapBoxLoading />
            <View
                style={[
                    appStyles.alignItemsCenter,
                    appStyles.pT5,
                    appStyles.pB2,
                ]}>
                <SwapDynamicSvgIcon
                    width={38}
                    height={38}
                    color={appColors.neutral.white}
                />
            </View>
            <SwapBoxLoading />
            <View style={appStyles.mt20}>
                <SkeletonLoadingCustomize height={40} width={'100%'} />
            </View>
        </Animated.View>
    );
};

const SwapBoxLoading: React.FC = () => {
    return (
        <>
            <View style={[appStyles.flexRow, appStyles.justifyContentBetween]}>
                <SkeletonLoadingCustomize
                    height={20}
                    width={100}
                    radius={'round'}
                />
                <SkeletonLoadingCustomize
                    height={20}
                    width={100}
                    radius={'round'}
                />
            </View>
            <View
                style={[
                    appStyles.backgroundWhite,
                    appStyles.pd15,

                    appStyles.flexRow,
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.mt10,
                    styles.b4,
                ]}>
                <View style={styles.gap10}>
                    <View
                        style={[
                            appStyles.flexRow,
                            appStyles.alignItemsCenter,
                            styles.gap10,
                        ]}>
                        <SkeletonLoadingCustomize
                            height={32}
                            width={32}
                            radius={'round'}
                        />
                        <SkeletonLoadingCustomize height={20} width={100} />
                    </View>
                    <SkeletonLoadingCustomize
                        height={17}
                        width={100}
                        radius={'round'}
                    />
                </View>
                <View style={[styles.gap10, appStyles.alignItemsEnd]}>
                    <SkeletonLoadingCustomize height={20} width={70} />
                    <SkeletonLoadingCustomize height={20} width={100} />
                </View>
            </View>
        </>
    );
};

const SkeletonLoadingCustomize: React.FC<
    Omit<MotiSkeletonProps, 'Gradient'>
> = props => {
    return (
        <AppSkeletonLoading
            colors={[
                appColors.neutral.n400,
                appColors.other.outline_lightest,
                appColors.other.outline_lightest,
                appColors.other.outline_lightest,
                appColors.neutral.n400,
                appColors.other.outline_lightest,
                appColors.neutral.n400,
            ]}
            {...props}
        />
    );
};

export const WalletBottomSheet: React.FC<WalletBottomSheetProps> = ({
    refModal,
    handlePressWallet,
    onClose,
    walletList,
    walletListId,
}) => {
    const theme = useAppTheme();
    const inset = useAppSafeAreaInsets();
    return (
        <BottomSheetModalGorhom
            refModal={refModal}
            containerStyles={styles.protocolContainer}
            snapPoints={['60']}
            enableContentPanningGesture={true}
            scrollEnable={false}
            onDismiss={onClose}>
            <View style={[appStyles.flex1]}>
                <BottomSheetFlatList
                    data={walletList}
                    renderItem={({ item, index }) => {
                        return (
                            <WalletItem
                                index={index}
                                item={item}
                                onPress={handlePressWallet}
                                theme={theme}
                                isSelected={item.id === walletListId}
                                styles={[
                                    appStyles.pV20,
                                    appStyles.backgroundWhite,
                                ]}
                            />
                        );
                    }}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.b4,
                        appStyles.ph12,
                        { paddingBottom: inset.bottom },
                    ]}
                />
            </View>
        </BottomSheetModalGorhom>
    );
};

export const HistoryItem: React.FC<SwapHistoryProps> = ({
    item,
    index,
    length,
    onPress,
    listImage,
}) => {
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.backgroundWhite,
                    appStyles.pd16,
                    appStyles.alignItemsCenter,
                    appStyles.mh15,
                    {
                        borderTopLeftRadius: index === 0 ? _borderRadius : 0,
                        borderTopRightRadius: index === 0 ? _borderRadius : 0,
                        borderBottomLeftRadius:
                            index === length - 1 ? _borderRadius : 0,
                        borderBottomRightRadius:
                            index === length - 1 ? _borderRadius : 0,
                        borderBottomWidth: index === length - 1 ? 0 : 0.5,
                        borderBottomColor: appColors.neutral.n300,
                    },
                ]}>
                <View style={[appStyles.flexRow, appStyles.flex1]}>
                    <View style={appStyles.iconCircleSize18}>
                        <SvgUri
                            uri={
                                listImage[
                                    `${item.payin.marketTicker}_${item.payin.network}`
                                ]
                            }
                            width={18}
                            height={18}
                        />
                    </View>
                    <View
                        style={[
                            appStyles.iconCircleSize18,
                            styles.receiveIcon,
                        ]}>
                        <SvgUri
                            uri={
                                listImage[
                                    `${item.payout.marketTicker}_${item.payout.network}`
                                ]
                            }
                            width={18}
                            height={18}
                        />
                    </View>
                    <View style={styles.swapIcon}>
                        <SwapSvgIcon width={10} height={10} />
                    </View>
                </View>

                {/* Middle */}
                <View style={[appStyles.flex4, appStyles.ml5]}>
                    <View
                        style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                        <AppText
                            titleWithI18n={LanguageKey.home_swap_title}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.neutral.n800}
                        />
                        <View
                            style={{
                                backgroundColor: getBackgroundColorByStatus(
                                    item.status,
                                ),
                                ...styles.statusBox,
                            }}>
                            <AppText
                                titleWithI18n={getTextByStatus(item.status)}
                                variant={TextVariantKeys.labelTiny}
                                textColor={getTextColorByStatus(item.status)}
                            />
                        </View>
                    </View>
                    <AppText
                        titleWithI18n={DateTimeUtils.formatDateTimeStandard(
                            item.createdAt,
                        )}
                        variant={TextVariantKeys.bodyRMedium}
                        textColor={appColors.neutral.n400}
                    />
                </View>
                {/* Right */}
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.alignItemsCenter,
                        appStyles.flexWrap,
                        appStyles.flex3,
                        appStyles.justifyContentEnd,
                        styles.rightItem,
                    ]}>
                    <AppText
                        title={getAmount(item.status, item) ?? ''}
                        variant={TextVariantKeys.titleSmall}
                        textColor={appColors.neutral.n800}
                        styles={[
                            appStyles.textAlignRight,
                            { color: getAmountColorByStatus(item.status) },
                        ]}
                    />
                    <AppText
                        titleWithI18n={` ${getSymbol(item.status, item)}`}
                        variant={TextVariantKeys.labelTiny}
                        textColor={appColors.neutral.n800}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const HeaderList: React.FC<HeaderListProps> = ({
    onPressProtocol,
    protocolSelected,
    nameWallet,
    onPressWallet,
}) => {
    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.justifyContentBetween,
                appStyles.pH15,
                appStyles.pB10,
            ]}>
            <TouchableOpacity
                onPress={onPressWallet}
                style={styles.protocolButtonContainer}>
                <>
                    <AppText
                        title={walletUtils.getShortAddress(nameWallet)}
                        textColor={appColors.neutral.n200}
                        variant={TextVariantKeys.labelSmall}
                    />
                    <DropdowSvgIcon
                        color={appColors.neutral.n200}
                        width={17}
                        height={17}
                    />
                </>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onPressProtocol}
                style={styles.protocolButtonContainer}>
                <>
                    <AppImage
                        uri={protocolSelected?.logo}
                        styleImage={appStyles.iconCircleSize18}
                    />
                    <AppText
                        title={protocolSelected?.symbol.toUpperCase()}
                        textColor={appColors.neutral.n200}
                        variant={TextVariantKeys.labelSmall}
                    />
                    <DropdowSvgIcon
                        color={appColors.neutral.n200}
                        width={17}
                        height={17}
                    />
                </>
            </TouchableOpacity>
        </View>
    );
};

export const Separator: React.FC = () => (
    <View style={appStyles.mh15}>
        <SeparatorLine />
    </View>
);

export const EmptyHistorySwap: React.FC = () => {
    return (
        <View
            style={[
                appStyles.flex1,
                appStyles.center,
                styles.gap10,
                appStyles.mt40,
            ]}>
            <EmptyTransactionSvgIcon color={appColors.neutral.black} />
            <AppText
                titleWithI18n={LanguageKey.swap_history_history_not_found}
                variant={TextVariantKeys.titleLarge}
                textColor={appColors.neutral.black}
            />
            <AppText
                titleWithI18n={LanguageKey.swap_history_history_not_found_sub}
                variant={TextVariantKeys.bodyRMedium}
                textColor={appColors.neutral.black}
            />
        </View>
    );
};
