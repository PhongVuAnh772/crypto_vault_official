import {
  BitcoinErrorType,
  IBitcoinDataRes,
  IBitcoinFullDataRes,
  IPushBitcoinTransaction,
} from "./type";

const BLOCK_CYPHER_BTC_DATA_URL =
  "https://api.blockcypher.com/v1/btc/main/addrs/";

const BLOCK_CYPHER_PUSH_TRANSACTION_URL =
  "https://api.blockcypher.com/v1/btc/main/txs/push";

class BitcoinServices {
  getBitcoinData = async (bitcoinAddress: string) => {
    try {
      const res = await fetch(
        `${BLOCK_CYPHER_BTC_DATA_URL}${bitcoinAddress}?unspentOnly=true`,
      );

      const data: IBitcoinDataRes | BitcoinErrorType = await res.json();

      if (!res.ok || (data as BitcoinErrorType)?.error) {
        return {
          isSuccess: false,
          data,
        };
      }

      return {
        isSuccess: true,
        data,
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

  getBitcoinFullData = async (bitcoinAddress: string) => {
    try {
      const res = await fetch(
        `${BLOCK_CYPHER_BTC_DATA_URL}${bitcoinAddress}/full?limit=50`,
      );

      const data: IBitcoinFullDataRes | BitcoinErrorType = await res.json();

      if (!res.ok || (data as BitcoinErrorType)?.error) {
        return {
          isSuccess: false,
          data,
        };
      }

      return {
        isSuccess: true,
        data,
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

  pushBitcoinTransactionAction = async (tx: string) => {
    try {
      const res = await fetch(BLOCK_CYPHER_PUSH_TRANSACTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tx }),
      });

      const data: IPushBitcoinTransaction | BitcoinErrorType = await res.json();

      if (!res.ok || (data as BitcoinErrorType)?.error) {
        return {
          isSuccess: false,
          data,
        };
      }

      return {
        isSuccess: true,
        data,
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
