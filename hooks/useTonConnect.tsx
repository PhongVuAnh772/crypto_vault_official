import React, { useMemo } from "react";

import { useAppSelector } from "src/core/redux/hooks";
import useAppSafeAreaInsets from "./useAppSafeAreaInsets";
import { TonConnectKey } from "src/core/enum/TonConnectKey";
import SessionTonConnect from "components/SessionTonConnect";
import {
  getShowModalConnect,
  getType,
} from "src/core/redux/slices/walletConnect.slice";

const useTonConnect = () => {
  const view = useAppSelector(getType);
  const insets = useAppSafeAreaInsets();
  const isShowModalConnect = useAppSelector(getShowModalConnect);
  const componentView = useMemo(() => {
    switch (view) {
      case TonConnectKey.eventConnect:
        return <SessionTonConnect />;
    }
  }, [view]);
  return {
    componentView,
    isShowModalConnect,
    insets,
  };
};

export default useTonConnect;
