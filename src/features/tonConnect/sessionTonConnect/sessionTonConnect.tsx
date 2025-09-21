import React from 'react';

import { StyleSheet, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import LoadingScreen from 'src/components/common/LoadingScreen';
import BottomSheetModalGorhom from 'src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import appStyles from 'src/core/styles';
import { TonConnectView } from '../component';
import useSessionTonConnect from './useSessionTonConnect';


export default function SessionTonConnect() {
    const { infoDapp, closeModal, confirm, tonAddressData, visibleLoading,showBottomSheetConnect } =
        useSessionTonConnect();
    const insets = useAppSafeAreaInsets();
    const style = useStyles(insets);
    return (
        <View style={[appStyles.flex1]}>
             <BottomSheetModalGorhom
             onDismiss={closeModal}
                refModal={showBottomSheetConnect}
              >
               <View style={style.box}>
                <TonConnectView
                    infoDapp={infoDapp}
                    tonAddressData={tonAddressData}
                    confirm={confirm}
                />
            </View>
            </BottomSheetModalGorhom>
            <LoadingScreen visible={visibleLoading} />
        </View>
    );
}
const useStyles = (insets: EdgeInsets) =>
    StyleSheet.create({
        box: {
            ...appStyles.flex1,
        },
    });
