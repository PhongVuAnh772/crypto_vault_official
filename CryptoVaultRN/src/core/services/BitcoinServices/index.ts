import { sendGet, sendPost } from "src/core/network/requests";
import {
  BitcoinErrorType,
  IBitcoinDataRes,
  IBitcoinFullDataRes,
  IPushBitcoinTransaction,
} from "./type";

class BitcoinServices {
  getBitcoinData = async (bitcoinAddress: string, isTestnet = false) => {
    try {
      const res = await sendGet({
        endPoint: `/bitcoin/data/${bitcoinAddress}`,
        params: { isTestnet },
      });

      if (!res?.isSuccess) {
        return {
          isSuccess: false,
          data: { error: "Unknown error" } as BitcoinErrorType,
        };
      }

      return {
        isSuccess: true,
        data: res.data as IBitcoinDataRes,
      };
    } catch (error) {
      console.log("error getBitcoinData", error);
      return {
        isSuccess: false,
        data: {
          error: String(error),
        } as BitcoinErrorType,
      };
    }
  };

  getBitcoinFullData = async (bitcoinAddress: string, isTestnet = false) => {
    try {
      const res = await sendGet({
        endPoint: `/bitcoin/full-data/${bitcoinAddress}`,
        params: { isTestnet },
      });

      if (!res?.isSuccess) {
        return {
          isSuccess: false,
          data: { error: "Unknown error" } as BitcoinErrorType,
        };
      }

      return {
        isSuccess: true,
        data: res.data as IBitcoinFullDataRes,
      };
    } catch (error) {
      return {
        isSuccess: false,
        data: {
          error: String(error),
        } as BitcoinErrorType,
      };
    }
  };

  pushBitcoinTransactionAction = async (tx: string, isTestnet = false) => {
    try {
      const res = await sendPost({
        endPoint: "/bitcoin/push-tx",
        body: { tx, isTestnet },
      });

      if (!res?.isSuccess) {
        return {
          isSuccess: false,
          data: { error: "Unknown error" } as BitcoinErrorType,
        };
      }

      return {
        isSuccess: true,
        data: res.data as IPushBitcoinTransaction,
      };
    } catch (error) {
      return {
        isSuccess: false,
        data: {
          error: String(error),
        } as BitcoinErrorType,
      };
    }
  };
}

export default BitcoinServices;
