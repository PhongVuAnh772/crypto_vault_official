import React from 'react';
import {
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppText from 'src/components/common/AppText';
import { MenuDotSvgIcon, SearchSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppSelector } from 'src/core/redux/hooks';
import appStyles from 'src/core/styles';
import appColors from 'src/core/constants/AppColors';
import Utils from 'src/core/utils/commonUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import HomeHeader from '../components/HomeHeader';
import HomeSkeletonLoading from '../components/HomeSkeletonLoading';
import { ListCryptoDataType } from '../home.type';
import { setSelectedCryptoDataId } from '../slice/home.slice';
import useBitcoinHome from './bitcoin.home.hook';

const BitcoinHomeView: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        goToMangeCryptoScreen,
        refreshingHome,
        handleHomeRefresh,
        walletBalanceCurrency,
        listCryptoData,
        isFirstInitial,
        dispatch,
        getBackgroundImage,
    } = useBitcoinHome({
        navigation,
    });

    // Lấy config từ remote server (đã lưu vào Redux appConfig)
    const remoteConfig = useAppSelector((state) => state.appConfig);
    const contacts = remoteConfig.contacts || [];

    const formatCurrency = (value: number) => {
        return Utils.formattedCurrency(value);
    };

    const rootNavigate = (key: string, params: object) => {
        navigation.navigate(key as any, params as any);
    };

    const renderHeader = () => (
        <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconCircle}>
                <MenuDotSvgIcon color={appColors.neutral.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
                <SearchSvgIcon color={appColors.neutral.white} />
            </TouchableOpacity>
        </View>
    );

    const renderBalance = () => (
        <View style={styles.balanceContainer}>
            <AppText
                title="Total Balance"
                variant={TextVariantKeys.bodyRSmall}
                textColor="rgba(255,255,255,0.7)"
            />
            <AppText
                title={formatCurrency(walletBalanceCurrency)}
                variant={TextVariantKeys.headlineMedium}
                textColor={appColors.neutral.white}
                styles={styles.balanceBig}
            />
        </View>
    );

    const renderQuickSend = () => {
        // Chỉ hiện nếu tính năng P2P được bật từ server
        if (!remoteConfig.features.p2pEnabled) return null;

        return (
            <View style={styles.quickSendContainer}>
                <View style={[appStyles.flexRow, appStyles.justifyContentBetween]}>
                    <AppText
                        title="Quick Send"
                        variant={TextVariantKeys.bodyRSmall}
                        textColor={appColors.neutral.white}
                    />
                    <TouchableOpacity style={styles.addBtn}>
                        <AppText title="+" textColor={appColors.neutral.white} styles={{ fontSize: 20 }} />
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={appStyles.mt15}>
                    {contacts.map((contact) => (
                        <View key={contact.id} style={styles.contactItem}>
                            <Image source={{ uri: contact.avatar_url }} style={styles.avatar} />
                            <AppText
                                title={contact.nickname}
                                variant={TextVariantKeys.bodyRTiny}
                                textColor="rgba(255,255,255,0.8)"
                                styles={appStyles.mt5}
                                numberOfLines={1}
                            />
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderCard = (item: ListCryptoDataType, index: number) => {
        const handleOnPress = () => {
            dispatch(setSelectedCryptoDataId(item.id));
            if (item.navigationKey) {
                rootNavigate(item.navigationKey, item.navigationParams as object);
            }
        };

        // Dynamic colors for cards like the design
        const cardColors = ['#1a1a1a', '#3498db', '#1c1c1c'];
        const cardColor = cardColors[index % cardColors.length];

        return (
            <TouchableOpacity
                key={item.id}
                onPress={handleOnPress}
                activeOpacity={0.9}
                style={[
                    styles.card,
                    { backgroundColor: cardColor, marginTop: index === 0 ? 0 : -100, zIndex: index }
                ]}
            >
                <View style={[appStyles.flexRow, appStyles.justifyContentBetween]}>
                    <AppText
                        title={(item.name || 'Account').toUpperCase()}
                        variant={TextVariantKeys.titleSmall}
                        textColor={appColors.neutral.white}
                    />
                    <AppText
                        title="VISA"
                        variant={TextVariantKeys.headlineSmall}
                        textColor={appColors.neutral.white}
                        styles={{ fontStyle: 'italic', fontWeight: 'bold' }}
                    />
                </View>
                
                <View style={appStyles.mt20}>
                    <AppText
                        title="**** **** **** 0000"
                        variant={TextVariantKeys.titleLarge}
                        textColor={appColors.neutral.white}
                        styles={{ letterSpacing: 2 }}
                    />
                </View>

                <View style={[appStyles.flexRow, appStyles.justifyContentBetween, appStyles.mt30]}>
                    <View>
                        <AppText
                            title="Token Symbol"
                            variant={TextVariantKeys.bodyRTiny}
                            textColor="rgba(255,255,255,0.6)"
                        />
                        <AppText
                            title={item.symbol}
                            variant={TextVariantKeys.titleSmall}
                            textColor={appColors.neutral.white}
                        />
                    </View>
                    <View style={appStyles.alignItemsEnd}>
                        <AppText
                            title="Balance"
                            variant={TextVariantKeys.bodyRTiny}
                            textColor="rgba(255,255,255,0.6)"
                        />
                        <AppText
                            title={Utils.formattedBalanceCurrency(item.balance ?? 0)}
                            variant={TextVariantKeys.titleSmall}
                            textColor={appColors.neutral.white}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper
            paddingTop
            paddingBottom
            backgroundImage={getBackgroundImage()}
            subStyle={[appStyles.flex1, appStyles.pH20]}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshingHome ?? false}
                        onRefresh={handleHomeRefresh}
                        tintColor={appColors.neutral.white}
                    />
                }
                showsVerticalScrollIndicator={false}
                style={appStyles.mt10}>
                <HomeSkeletonLoading isLoading={isFirstInitial}>
                    {renderHeader()}
                    {renderBalance()}
                    {renderQuickSend()}
                    <View style={[appStyles.mt30, { marginBottom: 50 }]}>
                        {listCryptoData.map((item, index) => renderCard(item, index))}
                    </View>
                    <TouchableOpacity 
                        onPress={goToMangeCryptoScreen}
                        style={[appStyles.center, appStyles.pV20]}
                    >
                         <AppText
                            title="Manage Assets"
                            variant={TextVariantKeys.titleSmall}
                            textColor="rgba(255,255,255,0.6)"
                        />
                    </TouchableOpacity>
                </HomeSkeletonLoading>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    balanceContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    balanceBig: {
        fontSize: 36,
        fontWeight: '700',
        marginTop: 5,
    },
    quickSendContainer: {
        marginTop: 40,
    },
    addBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactItem: {
        alignItems: 'center',
        marginRight: 20,
        width: 60,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: appColors.neutral.white,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        minHeight: 180,
        // Shadow for premium look
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.5,
        shadowRadius: 13.16,
        elevation: 20,
    }
});

export default BitcoinHomeView;
