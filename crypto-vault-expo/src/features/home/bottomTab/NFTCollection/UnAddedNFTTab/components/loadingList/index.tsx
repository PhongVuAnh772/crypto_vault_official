import React from 'react';
import { FlatList, View } from 'react-native';
import AppSkeletonLoading from 'src/components/common/AppSkeletonLoading';
import appStyles from 'src/core/styles';
import EmptyCollection from '../emptyCollection';
import styles from './styles';

export type LoadingContainerProps = {
    loading: boolean;
    onRefresh: () => void;
    refreshing: boolean;
};
const LoadingContainer: React.FC<LoadingContainerProps> = ({
    loading,
    onRefresh,
    refreshing,
}) => {
    if (!loading) {
        return (
            <EmptyCollection onRefresh={onRefresh} refreshing={refreshing} />
        );
    }
    const renderItem = () => {
        return (
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.pH15,
                    appStyles.fullWidth,
                    appStyles.pV15,
                    styles.loadingContainer,
                ]}>
                <View
                    style={[
                        appStyles.justifyContentBetween,
                        appStyles.alignItemsCenter,
                        appStyles.flex1,
                        appStyles.flexRow,
                    ]}>
                    <View
                        style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                        <View style={appStyles.ml10}>
                            <AppSkeletonLoading height={60} width={60} />
                        </View>
                        <View style={appStyles.ml15}>
                            <AppSkeletonLoading height={15} width={110} />

                            <View style={appStyles.mt12}>
                                <AppSkeletonLoading height={15} width={80} />
                            </View>
                        </View>
                    </View>

                    <View>
                        <AppSkeletonLoading height={30} width={50} />
                    </View>
                </View>
            </View>
        );
    };
    return (
        <FlatList
            data={[1, 2, 3, 4, 5, 6]}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={appStyles.mt15} />}
        />
    );
};

export default LoadingContainer;
