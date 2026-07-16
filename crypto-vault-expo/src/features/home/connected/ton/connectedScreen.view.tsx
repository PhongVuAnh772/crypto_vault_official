import React from 'react';
import { FlatList, View } from 'react-native';
import AppModal from 'src/components/common/AppModal';
import { Remove2SvgIcon } from 'src/core/constants/AppIconsSvg';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import { DappItem, ListEmpty } from './connectedScreen.component';
import useTonConnected from './connectedScreen.hook';

const TonConnectedScreen = () => {
    const {
        t,
        theme,
        infoDappRemove,
        isShowModalRemove,
        connectArray,
        showModalRemove,
        closeModalRemove,
        confirmRemoveConnect,
    } = useTonConnected();

    return (
        <View
            style={{
                flex: 1,
                padding: 14,
                backgroundColor:theme.colors.surface_surface_default
            }}
            >
            <FlatList
                data={connectArray}
                renderItem={({ item }) => {
                    return (
                        <DappItem item={item} removeDapp={showModalRemove} />
                    );
                }}
                ListEmptyComponent={ListEmpty}
                contentContainerStyle={appStyles.flex1}
            />

            <AppModal
                twoOptions
                visible={isShowModalRemove}
                onPress={confirmRemoveConnect}
                onPress2={closeModalRemove}
                titleWithI18n={t(
                    LanguageKey.common_text_remove_connection_Dapp,
                    {
                        name_dapp: infoDappRemove?.name,
                    },
                )}
                subTitleWithI18n={LanguageKey.common_text_sure_remove_Dapp}
                buttonTitleWithI18n={LanguageKey.common_text_confirm}
                buttonTitleWithI18n2={LanguageKey.cancel}
                textButtonSecondColor={
                    theme.colors.text_on_surface_text_brand_2
                }
                icon={<Remove2SvgIcon />}
            />
        </View>
    );
};

export default TonConnectedScreen;
