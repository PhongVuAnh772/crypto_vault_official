import { useCallback, useEffect, useState } from "react";
import { createWalletKit } from "src/utils/walletKitUtils";

export default function useInitializeWalletKit() {
  const [initialized, setInitialized] = useState(false);

  const onInitialize = useCallback(async () => {
    try {
      await createWalletKit();
      setInitialized(true);
    } catch (err: unknown) {
      console.log(err);
    }
  }, []);

  // // restart transport if relayer region changes
  // const onRelayerRegionChange = useCallback(() => {
  //   try {
  //     walletKit.core.relayer.restartTransport(relayerRegionURL);
  //     prevRelayerURLValue.current = relayerRegionURL;
  //   } catch (err: unknown) {
  //     console.log(err);
  //   }
  // }, [relayerRegionURL]);

  useEffect(() => {
    if (!initialized) {
      onInitialize();
    }
  }, [initialized, onInitialize]);

  return initialized;
}
