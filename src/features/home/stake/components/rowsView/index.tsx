import {FlatList} from 'react-native';
import React from 'react';
import {RowsViewProps} from './type';
import appStyles from 'src/core/styles';
import RowItem from '../rowItem';

const RowsView = ({data}: RowsViewProps) => {
    return (
        <FlatList
            data={data}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
            style={appStyles.backgroundWhite}
            renderItem={({item}) => (
                <RowItem title={item.title} value={item.value} />
            )}
        />
    );
};

export default RowsView;
