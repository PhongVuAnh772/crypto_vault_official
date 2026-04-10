import { useEffect, useRef } from "react";
import { useAppDispatch } from "src/core/redux/hooks";
import { setAppConfig, setLoading, setError } from "src/core/redux/slice/appConfig.slice";
import { getMobileProtocolListsWithSupportedTokens } from "src/core/redux/slice/account.slice";
import SyncService from "src/core/services/SyncService";
import axios from "axios";
import ApiConstants from "../constants/ApiConstants";

const useRemoteConfig = () => {
  const dispatch = useAppDispatch();
  const wsRef = useRef<WebSocket | null>(null);

  const syncData = async () => {
    try {
      console.log("🔄 Syncing data from Backend...");
      // 1. Fetch Features Config
      const configRes = await axios.get(`${ApiConstants.SERVER_URL}/api/v1/config`);

      // 2. Fetch Sync Assets (Public)
      const assets = await SyncService.fetchAssets();

      // 3. Fetch Sync Networks (Public)
      const networks = await SyncService.fetchNetworks();

      // Update Redux
      dispatch(setAppConfig({
        features: configRes.data.features,
        tokens: assets.map(a => ({
          id: a.id,
          symbol: a.symbol,
          enabled: true,
          priority: 0
        })),
        rpcUrls: networks.reduce((acc: any, n) => {
          acc[n.chain_key] = n.chain_key || "";
          return acc;
        }, {})
      }));

      // 4. Force refresh Protocols list in Account slice
      dispatch(getMobileProtocolListsWithSupportedTokens(undefined) as any);

      console.log("✅ Successfully synced data from Backend (Supabase)");
    } catch (err) {
      console.log("❌ Failed to sync remote data:", err);
      dispatch(setError("Sync error"));
    }
  };

  const setupWebSocket = () => {
    // Convert http to ws URL
    const wsUrl = ApiConstants.SERVER_URL.replace('http', 'ws');

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🔌 Connected to Real-time Config Sync");
      };

      ws.onmessage = (e) => {
        const message = JSON.parse(e.data);
        if (message.event === 'config_update') {
          console.log("🔔 Config update received via WS! Resyncing...");
          syncData();
        }
      };

      ws.onclose = () => {
        console.log("🔌 WS Disconnected. Retrying in 5s...");
        setTimeout(setupWebSocket, 5000);
      };
    } catch (err) {
      console.error("WS connection error:", err);
    }
  };

  useEffect(() => {
    syncData();
    setupWebSocket();
    return () => {
      wsRef.current?.close();
    }
  }, []);

  return { refreshConfig: syncData };
};

export default useRemoteConfig;
