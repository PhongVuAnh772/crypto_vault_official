import { t } from 'i18next';
import React from 'react';
import { FlatList, View } from 'react-native';
import AppModal from 'src/components/common/AppModal';
import { Remove2SvgIcon } from 'src/core/constants/AppIconsSvg';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import useTonConnected from './evmConnect.hook';
import { DappItem, ListEmpty, SessionDapp } from './evmConnected.component';

const EvmConnectedScreen = () => {
    const {
        theme,
        activeSessions,
        infoDappRemove,
        isShowModalRemove,
        showModalRemove,
        closeModalRemove,
        confirmRemoveSession,
    } = useTonConnected();
    const dataList: SessionDapp[] = Object.entries(activeSessions).map(
        ([key, value]) => ({
            dAppData: {
                peer: value.peer.metadata,
            },
            topic: key,
        }),
    );

    return (
        <View
            style={{
                flex: 1,
                padding: 14,
            }}>
            <FlatList
                data={dataList}
                keyExtractor={item => item.topic}
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
                onPress={confirmRemoveSession}
                onPress2={closeModalRemove}
                titleWithI18n={t(
                    LanguageKey.common_text_remove_connection_Dapp,
                    {
                        name_dapp: infoDappRemove?.dAppData.peer.name,
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
export default EvmConnectedScreen;
