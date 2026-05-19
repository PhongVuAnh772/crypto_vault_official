import { useMemo, useState } from 'react';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
  getMobileProtocolListsWithSupportedTokens,
  getProtocolDataLists,
  getSelectedProtocolId,
  setSelectedProtocol,
} from 'src/core/redux/slice/account.slice';
import { AppThemeType } from 'src/core/type/ThemeType';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';

const useAddProtocol = () => {
  const theme: AppThemeType = useAppTheme();
  const dispatch = useAppDispatch();
  const selectedProtocolId = useAppSelector(getSelectedProtocolId);
  const protocolList = useAppSelector(getProtocolDataLists) || [];
  const [search, setSearch] = useState('');

  const filteredProtocols = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return protocolList;
    return protocolList.filter((item) => {
      const name = String(item.name || '').toLowerCase();
      const symbol = String(item.symbol || '').toLowerCase();
      const vm = String(item.VM || '').toLowerCase();
      return name.includes(keyword) || symbol.includes(keyword) || vm.includes(keyword);
    });
  }, [protocolList, search]);

  const suggested = useMemo(
    () => filteredProtocols.filter((item) => item.isDefault || item.status === 'active'),
    [filteredProtocols],
  );
  const custom = useMemo(
    () => filteredProtocols.filter((item) => !item.isDefault),
    [filteredProtocols],
  );

  const onSelectProtocol = (item: ProtocolDataWithSupportedTokensFormBEType) => {
    dispatch(setSelectedProtocol(item._id));
  };

  const onRefreshProtocol = async () => {
    await dispatch(getMobileProtocolListsWithSupportedTokens(undefined));
  };

  return {
    theme,
    search,
    setSearch,
    selectedProtocolId,
    suggested,
    custom,
    onSelectProtocol,
    onRefreshProtocol,
  };
};
export default useAddProtocol;
