import React from 'react';
import {Text, View} from 'react-native';
import {LoadingTransactionRezPointViewProps} from './types';

const LoadingTransactionRezPointView = ({
    isTransactionHistoryLoading,
    onRefresh,
    refreshing,
}: LoadingTransactionRezPointViewProps) => {
    return (
        <View>
            <Text>LoadingTransactionRezPointView</Text>
        </View>
    );
};

export default LoadingTransactionRezPointView;
