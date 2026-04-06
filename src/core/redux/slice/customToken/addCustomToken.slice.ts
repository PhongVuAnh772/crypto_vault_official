import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Address } from "@ton/core";
import { createSelector } from "reselect";
import VMType from "src/core/enum/VMType";
import { RootState } from "src/core/redux/store";
import { compareAddressesEVM } from "src/core/utils/evmUtils";
import {
  AddTokenParamsType,
  ChangeActiveTokenType,
  ConvertTokenFromBEParamDataType,
  LocalTokenReducerType,
  OriginTokenType,
  SupportedTokenItemWithProtocol,
  SupportTokenDataType,
  TokenType,
  UpdateNativeBalancePayload,
  UpdateTokenBalances,
} from "./addCustomToken.type";


const initialState: LocalTokenReducerType = {
  listTokenByProtocol: {},
  listTokenFromBE: {},
};

export const localTokenReducer = createSlice({
  name: "localTokenReducer",
  initialState: initialState,
  reducers: {
    addCustomToken: (state, action: PayloadAction<AddTokenParamsType>) => {
      const { token, id } = action.payload;
      if (state.listTokenByProtocol?.[id]) {
        const exitsToken = state.listTokenByProtocol[id]?.filter((item) =>
          compareAddressesEVM(item?.contractAddress, token?.contractAddress)
        );
        if (!exitsToken.length) {
          state.listTokenByProtocol[id].push(token);
        }
      } else {
        state.listTokenByProtocol[id] = [token];
      }
    },
    activeJettonFromBE: (
      state,
      action: PayloadAction<ChangeActiveTokenType>
    ) => {
      const { contractAddress, id, value } = action.payload;
      if (state.listTokenFromBE.hasOwnProperty(id)) {
        state.listTokenFromBE[id] = state.listTokenFromBE[id].map((item) => {
          if (!item.isNativeToken) {
            const parsedItemAddress = Address.parse(
              item.contractAddress
            ).toRawString();
            const parsedInitAddress =
              Address.parse(contractAddress).toRawString();
            if (parsedItemAddress === parsedInitAddress) {
              item.active = value;
            }
          }
          return item;
        });
      }
    },
    updateNativeBalance: (
      state,
      action: PayloadAction<UpdateNativeBalancePayload>
    ) => {
      const { walletAddress, protocolData, balance, usd_price } =
        action.payload;

      /** -----------------
       * UPDATE BE TOKENS
       * ----------------- */
      state.listTokenFromBE[protocolData._id] = state.listTokenFromBE[
        protocolData._id
      ]?.map((token) => {
        if (token.isNativeToken) {
          token.balance = +balance;
          token.balanceCurrency = usd_price;
        }
        return token;
      });

      /** -----------------
       * UPDATE LOCAL TOKENS
       * ----------------- */
      const id = `${walletAddress}_${protocolData.slip0044}`;
      state.listTokenByProtocol[id] = state.listTokenByProtocol[id]?.map(
        (token) => {
          if (token.isNativeToken) {
            token.balance = +balance;
            token.balanceCurrency = usd_price;
          }
          return token;
        }
      );
    },

    onChangeActiveJetton: (
      state,
      action: PayloadAction<ChangeActiveTokenType>
    ) => {
      const { contractAddress, id, value } = action.payload;
      if (state.listTokenByProtocol.hasOwnProperty(id)) {
        state.listTokenByProtocol[id] = state.listTokenByProtocol[id].map(
          (item) => {
            if (item.contractAddress === contractAddress) {
              item.active = value;
            }
            return item;
          }
        );
      }
    },
    activeTokenFromBE: (
      state,
      action: PayloadAction<ChangeActiveTokenType>
    ) => {
      const { contractAddress, id, value } = action.payload;
      if (state.listTokenFromBE.hasOwnProperty(id)) {
        state.listTokenFromBE[id] = state.listTokenFromBE[id].map((item) => {
          if (!item.isNativeToken) {
            const token = item as SupportedTokenItemWithProtocol;

            if (token.contractAddress === contractAddress) {
              item.active = value;
            }
          }
          return item;
        });
      }
    },
    onChangeActiveToken: (
      state,
      action: PayloadAction<ChangeActiveTokenType>
    ) => {
      const { contractAddress, id, value } = action.payload;
      if (state.listTokenByProtocol.hasOwnProperty(id)) {
        state.listTokenByProtocol[id] = state.listTokenByProtocol[id].map(
          (item) => {
            if (item.contractAddress === contractAddress) {
              item.active = value;
            }
            return item;
          }
        );
      }
    },
    convertTokenFromBE: (
      state,
      action: PayloadAction<ConvertTokenFromBEParamDataType[]>
    ) => {
      const data = action.payload;
      if (data) {
        const allTokens = data.flatMap((protocol) => {
          if (!(protocol.VM === VMType.EVM || protocol.VM === VMType.Ton || protocol.VM === VMType.Bitcoin)) {
            return [];
          }
          return protocol.supportedToken.map((token) => {
            const convertedTokenBE = token as SupportedTokenItemWithProtocol;

            const findItemSaved = state.listTokenFromBE?.[protocol._id]?.find(
              (tokenLocal) => {
                const convertedDataTokenLocal =
                  tokenLocal as SupportedTokenItemWithProtocol;
                return (
                  convertedDataTokenLocal?.contractAddress ===
                  convertedTokenBE?.contractAddress
                );
              }
            );

            const data: TokenType = {
              ...token,
              idProtocol: protocol._id,
              active: findItemSaved?.active ?? false,
              balance: findItemSaved?.balance ?? 0,
              balanceCurrency: findItemSaved?.balanceCurrency ?? 0,
            };

            // Process the second loop logic here
            if (!token.isNativeToken) {
              for (const key in state.listTokenByProtocol) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [_, slip] = key.split("_");
                if (parseInt(slip, 10) === protocol.slip0044) {
                  const filteredTokens = state.listTokenByProtocol[key].filter(
                    (tokenLocal) => {
                      const tokenLocalConverted =
                        tokenLocal as SupportedTokenItemWithProtocol;
                      const matchContractAddress = !compareAddressesEVM(
                        tokenLocalConverted?.contractAddress,
                        convertedTokenBE?.contractAddress
                      );
                      const dataTokenConverted =
                        data as SupportedTokenItemWithProtocol;

                      if (
                        !matchContractAddress &&
                        compareAddressesEVM(
                          tokenLocalConverted.contractAddress,
                          dataTokenConverted.contractAddress
                        )
                      ) {
                        data.active = tokenLocal.active;
                      }
                      return matchContractAddress;
                    }
                  );

                  state.listTokenByProtocol[key] = filteredTokens;
                }
              }
            }

            return data;
          });
        });

        state.listTokenFromBE = allTokens.reduce<
          Record<string, SupportTokenDataType>
        >((result, token) => {
          const { idProtocol } = token;
          if (!result[idProtocol]) {
            result[idProtocol] = [];
          }

          result[idProtocol].push(token);

          return result;
        }, {});
      }
    },
    updateBalanceToken: (state, action: PayloadAction<UpdateTokenBalances>) => {
      const { walletAddress, tokens, protocolData } = action.payload;

      // update for BE
      state.listTokenFromBE[protocolData._id] = state.listTokenFromBE[
        protocolData._id
      ]?.map((token) => {
        const lowerCaseToken = token.contractAddress.toLocaleLowerCase() || "";

        if (tokens[lowerCaseToken]) {
          token.balance = +tokens[lowerCaseToken].balance;
          token.balanceCurrency = tokens[lowerCaseToken].usd_price;
        }
        return token;
      });

      // update for Local
      const id = `${walletAddress}_${protocolData.slip0044}`;
      state.listTokenByProtocol[id] = state.listTokenByProtocol[id]?.map(
        (token) => {
          const lowerCaseToken =
            token?.contractAddress.toLocaleLowerCase() || "";
          if (tokens[lowerCaseToken]) {
            token.balance = +tokens[lowerCaseToken].balance;
            token.balanceCurrency = tokens[lowerCaseToken].usd_price;
          }
          return token;
        }
      );
    },
    updateBalanceTokens: (
      state,
      action: PayloadAction<UpdateTokenBalances>
    ) => {
      const { walletAddress, tokens, protocolData } = action.payload;
      // update for BE
      state.listTokenFromBE[protocolData._id] = state.listTokenFromBE[
        protocolData._id
      ]?.map((token) => {
        const lowerCaseToken = token.contractAddress?.toLocaleLowerCase() || "";
        if (tokens[lowerCaseToken]) {
          token.balance = +tokens[lowerCaseToken].balance;
          token.balanceCurrency = tokens[lowerCaseToken].usd_price;
        } else {
          token.balance = 0;
          token.balanceCurrency = 0;
        }
        return token;
      });

      // update for Local
      const id = `${walletAddress}_${protocolData.slip0044}`;
      state.listTokenByProtocol[id] = state.listTokenByProtocol[id]?.map(
        (token) => {
          const lowerCaseToken =
            token?.contractAddress.toLocaleLowerCase() || "";
          if (tokens[lowerCaseToken]) {
            token.balance = +tokens[lowerCaseToken].balance;
            token.balanceCurrency = tokens[lowerCaseToken].usd_price;
          } else {
            token.balance = 0;
            token.balanceCurrency = 0;
          }
          return token;
        }
      );
    },
    deleteTokensByWallet: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (id && state.listTokenByProtocol[id]) {
        delete state.listTokenByProtocol[id];
      }
    },
    deleteTokensByAccount: (state, action: PayloadAction<string[]>) => {
      const listAddress = action.payload;
      if (listAddress.length) {
        const convertedListTokenByProtocol = Object.keys(
          state.listTokenByProtocol
        );
        convertedListTokenByProtocol.forEach((idSaveToken) => {
          listAddress.forEach((address) => {
            if (
              idSaveToken
                .toLocaleLowerCase()
                .startsWith(address.toLocaleLowerCase())
            ) {
              delete state.listTokenByProtocol[idSaveToken];
            }
          });
        });
      }
    },
  },
});

const getAccountData = (state: RootState) => state.account;
export const getCurrentWalletAndProtocol = createSelector(
  [getAccountData],
  ({
    accountLists,
    selectAccountId,
    selectedProtocolId,
    protocolListsWithSupportedTokensFromBE,
  }) => {
    if (!protocolListsWithSupportedTokensFromBE?.length || !accountLists)
      return;

    const currentProtocolBaseData = protocolListsWithSupportedTokensFromBE.find(
      (e) => e._id === selectedProtocolId
    );

    const accountWallet = accountLists.find((e) => e.id === selectAccountId);
    if (!accountWallet || !currentProtocolBaseData) return;

    const currentProtocol = accountWallet.protocolData.find(
      (e) => e._id === selectedProtocolId
    );

    const addRessData = currentProtocol?.addressList.find(
      (e) => e.id === currentProtocol.selectedAddressId
    );

    if (!addRessData) return;
    console.log(`currentProtocolBaseData ${currentProtocolBaseData}`);
    return {
      currentProtocol: currentProtocolBaseData,
      currentWallet: addRessData,
      accountId: selectAccountId,
    };
  }
);

export const getFullListTokens = createSelector(
  [
    getCurrentWalletAndProtocol,
    (state: RootState) => state.tokenLocal.listTokenByProtocol,
    (state: RootState) => state.tokenLocal.listTokenFromBE,
  ],
  (data, listTokenByProtocol, listTokenBE) => {
    if (!data) return [];
    const { currentProtocol, currentWallet } = data;

    console.log("currentProtocol getFullListTokens ${getFullListTokens");

    const listLocal =
      listTokenByProtocol[
        `${currentWallet.address}_${currentProtocol.slip0044}`
      ] || [];
    const listBE =
      listTokenBE[currentProtocol._id]?.filter(
        (item) => !item?.isNativeToken
      ) || [];

    return [...listLocal, ...listBE];
  }
);
// Memoized selector for filtering tokens from both local and backend
export const filterTokenByWalletAddress = createSelector(
  [
    getCurrentWalletAndProtocol,
    (state: RootState) => state.tokenLocal.listTokenByProtocol,
    (state: RootState) => state.tokenLocal.listTokenFromBE,
  ],
  (data, listTokenByProtocol, listTokenFromBE) => {
    console.log(`listTokenFromBE ${listTokenFromBE}`);
    if (!data) return [];
    const { currentProtocol, currentWallet } = data;
    
    const customTokens =
      listTokenByProtocol[
        `${currentWallet.address}_${currentProtocol.slip0044}`
      ]?.map((item) => {
        return {
          ...item,
          originTokenType: OriginTokenType.LOCAL,
        };
      }) || [];

    const backendTokens =
      listTokenFromBE[currentProtocol._id]?.map((item) => {
        return {
          ...item,
          originTokenType: OriginTokenType.BE,
        };
      }) || [];

    const mergedTokens = [
      ...backendTokens, 
      ...customTokens];

    const seenAddresses = new Set();

    const uniqueTokens = mergedTokens.filter((item) => {
      if (item.isNativeToken) {
        return true;
      }
      const token = item as SupportedTokenItemWithProtocol;
      const address = token.contractAddress?.toLowerCase();
      if (!address || seenAddresses.has(address)) return false;
      seenAddresses.add(address);
      return true;
    });
    const tokensByContractAddress: Record<
      string,
      SupportedTokenItemWithProtocol
    > = customTokens.reduce(
      (acc, token) => {
        acc[token.contractAddress] = token;
        return acc;
      },
      {} as Record<string, SupportedTokenItemWithProtocol>
    );
    const checkTokenData = uniqueTokens.map((item) => {
      const token = item as SupportedTokenItemWithProtocol;
      const matchItem = tokensByContractAddress?.[token?.contractAddress];
      if (matchItem) {
        item.active = matchItem.active;
      }
      return item;
    });
    console.log(`checkTokenData ${checkTokenData}`);

    return checkTokenData;
  }
);

export const filterTokenAvailable = createSelector(
  [
    getCurrentWalletAndProtocol,
    (state: RootState) => state.tokenLocal.listTokenByProtocol,
    (state: RootState) => state.tokenLocal.listTokenFromBE,
  ],
  (data, listTokenByProtocol, listTokenFromBE) => {
    if (!data) return [];
    const { currentProtocol, currentWallet } = data;
    const customTokens =
      listTokenByProtocol[
        `${currentWallet.address}_${currentProtocol.slip0044}`
      ] || [];
    const backendTokens = listTokenFromBE[currentProtocol._id] || [];
    const filterListBETokens = backendTokens
      .filter((token) => token?.isNativeToken || token?.active)
      .sort((a, b) => (b.isNativeToken ? 1 : 0) - (a.isNativeToken ? 1 : 0));
    const filterToken = customTokens.filter((token) => token?.active);

    const allToken = [
      ...filterListBETokens, 
      ...filterToken];

    const seenAddresses = new Set();

    const uniqueTokens = allToken.filter((item) => {
      if (item.isNativeToken) {
        return true;
      }
      const token = item as SupportedTokenItemWithProtocol;
      const address = token.contractAddress?.toLowerCase();
      if (!address || seenAddresses.has(address)) return false;
      seenAddresses.add(address);
      return true;
    });
    return uniqueTokens;
  }
);
export const {
  addCustomToken,
  onChangeActiveToken,
  convertTokenFromBE,
  updateBalanceToken,
  deleteTokensByWallet,
  deleteTokensByAccount,
  activeTokenFromBE,
  updateBalanceTokens,
  activeJettonFromBE,
  onChangeActiveJetton,
  updateNativeBalance,
} = localTokenReducer.actions;
const localTokenReducerExport = localTokenReducer.reducer;

export default localTokenReducerExport;
