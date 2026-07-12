import React from 'react';
import useAddProtocol from './addProtocol.hook';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { ScreenWrapper } from 'src/components';
import addProtocolStyle from './addProtocol.style';
import LanguageKey from 'src/core/locales/LanguageKey';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';

const Tab = createMaterialTopTabNavigator();

enum TabScreen {
  Suggested = 'Suggested',
  CustomProtocol = 'Custom protocol',
}

const ProtocolList: React.FC<{
  data: ProtocolDataWithSupportedTokensFormBEType[];
  selectedProtocolId?: string;
  onSelectProtocol: (item: ProtocolDataWithSupportedTokensFormBEType) => void;
  style: ReturnType<typeof addProtocolStyle>;
}> = ({ data, selectedProtocolId, onSelectProtocol, style }) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item._id}
      contentContainerStyle={style.listContainer}
      renderItem={({ item }) => {
        const selected = selectedProtocolId === item._id;
        return (
          <TouchableOpacity
            style={[style.protocolCard, selected && style.protocolCardSelected]}
            activeOpacity={0.85}
            onPress={() => onSelectProtocol(item)}
          >
            <View style={style.protocolLeft}>
              <Image
                source={item.logo ? { uri: item.logo } : undefined}
                defaultSource={require('../../../../../assets/images/logo_app_crypto.png')}
                style={style.protocolLogo}
              />
              <View style={style.protocolTextGroup}>
                <Text style={style.protocolName}>{item.name}</Text>
                <Text style={style.protocolMeta}>
                  {String(item.symbol || '').toUpperCase()} · {String(item.VM || '')}
                </Text>
              </View>
            </View>
            <View style={[style.statusDot, selected && style.statusDotActive]} />
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={<Text style={style.emptyText}>No protocol found</Text>}
    />
  );
};

const AddProtocol: React.FC<RootNavigationType> = ({navigation}) => {
  const {
    theme,
    search,
    setSearch,
    selectedProtocolId,
    suggested,
    custom,
    onSelectProtocol,
  } = useAddProtocol();
  const style = addProtocolStyle(theme);
  return (
    <ScreenWrapper
      paddingTop
      enableHeader
      paddingBottom
      headerTitleWithI18n={LanguageKey.common_protocol}
      backgroundColor={theme.colors.surface_surface_default}
    >
      <View style={style.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search protocol"
          placeholderTextColor={theme.colors.text_on_surface_text_light}
          style={style.searchInput}
        />
      </View>
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: style.tabBarLabelStyle,
          tabBarStyle: style.tabBarStyle,
          tabBarIndicatorStyle: style.tabBarIndicatorStyle,
          tabBarInactiveTintColor: theme.colors.text_on_surface_text_light,
        }}
      >
        <Tab.Screen name={TabScreen.Suggested}>
          {() => (
            <View style={style.container}>
              <ProtocolList
                data={suggested}
                selectedProtocolId={selectedProtocolId}
                onSelectProtocol={onSelectProtocol}
                style={style}
              />
            </View>
          )}
        </Tab.Screen>
        <Tab.Screen name={TabScreen.CustomProtocol}>
          {() => (
            <View style={style.container}>
              <ProtocolList
                data={custom}
                selectedProtocolId={selectedProtocolId}
                onSelectProtocol={onSelectProtocol}
                style={style}
              />
            </View>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </ScreenWrapper>
  );
};
export default AddProtocol;
