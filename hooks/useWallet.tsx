import React, { useMemo } from "react";
import { useAppSelector } from "src/core/redux/hooks";

import useAppSafeAreaInsets from "./useAppSafeAreaInsets";
import { WalletConnectKey } from "src/core/enum/WalletConnectKey";
import {
  getShowModalConnect,
  getType,
} from "src/core/redux/slices/walletConnect.slice";
import SessionNoSupport from "components/SessionNoSupport";
const useWallet = () => {
  const view = useAppSelector(getType);

  const insets = useAppSafeAreaInsets();

  const isShowModalConnect = useAppSelector(getShowModalConnect);

  const componentView = useMemo(() => {
    switch (view) {
      default:
        return <SessionNoSupport />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  return {
    componentView,
    isShowModalConnect,
    insets,
  };
};

export default useWallet;
