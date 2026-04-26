import AsyncStorage from "@react-native-async-storage/async-storage";
import { PayloadAction, createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import appConstants from "src/core/constants/AppConstants";
import EnvConfig from "src/core/constants/EnvConfig";
import { DefaultProtocolDataList } from "src/core/constants/ProtocolDefaultData";
import AppToastType from "src/core/enum/AppToastType";
import ReduxKey from "src/core/enum/ReduxKey";
import Slip0044 from "src/core/enum/Slip0044";
import AppI18Next from "src/core/locales";
import LanguageKey from "src/core/locales/LanguageKey";
import NativeWalletCoreModule from "src/core/modules/WalletCoreModules/NativeWalletCoreModule";
import sendGet from "src/core/network/requests/sendGet";
import sendPost from "src/core/network/requests/sendPost";
import { convertTokenFromBE } from "src/core/redux/slice/customToken/addCustomToken.slice";
import {
  deleteEVMCollectionByAccount,
  deleteTonCollectionByAccount,
} from "src/core/redux/slice/NFT/NFTImport.slice";
import { RootState } from "src/core/redux/store";
import { getIsTestnet } from "./app.selector";
import AccountServices from "src/core/services/AccountServices";
import AccountUtils from "src/core/utils/accountUtils";
import Utils from "src/core/utils/commonUtils";
import {
  AccountSliceType,
  AccountType,
  AddressListItemType,
  ProtocolDataFromBEType,
  ProtocolDataType,
  ProtocolDataWithSupportedTokensFormBEType,
  ProtocolListDataAPI,
} from "./account.type";

const initialState: AccountSliceType = {
  protocolListsFromBE: undefined,
  protocolListsWithSupportedTokensFromBE: DefaultProtocolDataList,
  selectedProtocolId: undefined,
  loading: false,
  resetAction: false,
  error: undefined,
  temporaryMnemonic: null,
  pin: null,
  selectAccountId: undefined,
  accountLists: undefined,
};

import VMType from "src/core/enum/VMType";
import TonWalletVersion from "src/core/enum/TonWalletVersion";

export const MOCK_PROTOCOLS_WITH_SUPPORTED_TOKENS: ProtocolDataWithSupportedTokensFormBEType[] = [];

export const MOCK_PROTOCOL_LIST_RESPONSE: ProtocolListDataAPI = { items: [] };

export const getMobileProtocolListsWithSupportedTokens = createAsyncThunk(
  "account/getMobileProtocolListsWithSupportedTokens",
  async (
    initMnemonic: string | undefined,
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      console.log("run getMobileProtocolListsWithSupportedTokens");
      const state = getState() as RootState;
      const isTestNet = getIsTestnet(state);
      const accountState = state?.account;
      const pinCode = accountState?.pin;
      const accountLists = accountState?.accountLists;
      let protocolDataFromBe:
        | ProtocolDataWithSupportedTokensFormBEType[]
        | undefined;
      const res = await sendGet<ProtocolDataWithSupportedTokensFormBEType[]>({
        endPoint: "public/mobile/protocols/get-supported-tokens",
      });

      console.log('--- API GET PROTOCOL LIST ---');
      console.log('Result Success:', res.isSuccess);
      if (res.isSuccess) {
        console.log('Data count:', res.data?.length);
        protocolDataFromBe = res?.data;
      } else {
        console.log('Error API:', res);
        protocolDataFromBe = [];
      }

      // Luôn cập nhật danh sách rỗng nếu không có dữ liệu để UI Reset
      dispatch(setProtocolListsWithSupportedTokensFromBE(protocolDataFromBe || []));
      dispatch(convertTokenFromBE(protocolDataFromBe || []));

      const mnemonic = accountLists?.[0]?.mnemonic ?? initMnemonic;

      if (!mnemonic) {
        console.log('Mnemonic missing, protocol list updated.');
        return protocolDataFromBe || [];
      }

      console.log("continue mnemonic for wallet generation");

      const checkSlip0044Data = await AccountUtils.checkProtocolData({
        protocolListsFromBE: protocolDataFromBe,
        mnemonic: mnemonic,
        isTestNet: isTestNet, // Keep global for now but the selector already shows everything
      });

      console.log(`checkSlip0044Data ${checkSlip0044Data}`);

      const finalProtocolData =
        AccountUtils.checkProtocolDataWithDefaultData(checkSlip0044Data);

      const accountData =
        await AccountUtils.checkAccountProtocolDataAndGenerateAccountData(
          accountState,
          dispatch,
          finalProtocolData,
          isTestNet
        );

      if (accountData && pinCode) {
        const accountServices = new AccountServices();

        await accountServices.saveAccountDataWithEncrypt(accountData, pinCode);
        dispatch(setAccount(accountData));
      }

      dispatch(convertTokenFromBE(finalProtocolData));

      return finalProtocolData;
    } catch (error) {
      console.log("getMobileProtocolListsWithSupportedTokens error", error);
      return rejectWithValue(error);
    }
  }
);

export const getMobileProtocolLists = createAsyncThunk(
  "account/getListProtocol",
  async (
    {
      status,
      protocolName,
      sort,
      page,
      perPage,
    }: {
      status?: string;
      protocolName?: string;
      sort?: string;
      page?: string;
      perPage?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await sendGet<ProtocolListDataAPI>({
        endPoint: "public/mobile/protocols",
        params: {
          page: page,
          perPage: perPage,
          sort: sort,
          protocolName: protocolName,
          status: status,
        },
      });
      const items: ProtocolDataFromBEType[] | undefined =
        response?.data?.items ?? MOCK_PROTOCOL_LIST_RESPONSE.items;
      return items || [];
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// MARK: Edit account.
export const editAccount = createAsyncThunk(
  "account/edit",
  async (account: AccountType, { getState, rejectWithValue }) => {
    try {
      const rootState = getState() as RootState;
      const accountLists = rootState.account.accountLists;
      const pinCode = rootState.account.pin;
      const newAccountList =
        accountLists?.filter((e) => e.mnemonic !== account.mnemonic) ?? [];
      newAccountList?.push(account);
      const accountServices = new AccountServices();

      if (pinCode) {
        const resSaveAccount = await accountServices.saveAccountDataWithEncrypt(
          newAccountList,
          pinCode
        );
        if (resSaveAccount) {
          return newAccountList;
        }
      }
      return rejectWithValue(null);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// MARK: Change account.
export const changeAccount = createAsyncThunk(
  "account/change",
  async (item: AccountType, { dispatch, getState, rejectWithValue }) => {
    try {
      const rootState = getState() as RootState;
      const selectAccountId = rootState.account.selectAccountId;
      if (selectAccountId !== item.mnemonic) {
        dispatch(setSelectAccountId(item.id));
        return true;
      }
    } catch (error) {
      rejectWithValue(error);
    }
  }
);

// MARK: Sync Wallets to Backend
export const loadWalletsFromStorage = createAsyncThunk(
  "account/loadWallets",
  async (pinCode: string, { dispatch }) => {
    try {
      const accountServices = new AccountServices();
      const accountsData = await accountServices.getAccountDataWithEncrypt(pinCode);
      if (accountsData) {
        dispatch(setAccount(accountsData));
        return accountsData;
      }
    } catch (error) {
      console.error("Load wallets failed:", error);
    }
    return undefined;
  }
);

export const syncWalletsToBackend = createAsyncThunk(
  "account/syncWallets",
  async (_, { getState }) => {
    try {
      const state = getState() as RootState;
      const accountLists = state.account.accountLists;
      if (!accountLists || accountLists.length === 0) return;

      const userId = accountLists[0].id;
      const walletsToSync: any[] = [];

      accountLists.forEach(account => {
        if (account.protocolData) {
          account.protocolData.forEach(protocol => {
            if (protocol.addressList) {
              protocol.addressList.forEach(wallet => {
                walletsToSync.push({
                  chainId: protocol._id,
                  address: wallet.address,
                  metadata: {
                    name: wallet.name,
                    path: wallet.path,
                    index: wallet.index,
                    nickname: account.name
                  }
                });
              });
            }
          });
        }
      });

      if (walletsToSync.length === 0) return;

      console.log(`Syncing ${walletsToSync.length} wallets to backend for user ${userId}...`);
      await sendPost({
        endPoint: "public/mobile/wallets/sync",
        body: {
          userId,
          wallets: walletsToSync
        }
      });
    } catch (error) {
      console.error("Wallet sync failed:", error);
    }
  }
);

// MARK: Add account.
export const addAccount = createAsyncThunk(
  "account/add",
  async (
    { mnemonic, pinCode }: { mnemonic: string; pinCode: string },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const rootState = getState() as RootState;

      const accountState = rootState.account;
      const selectedProtocolId = accountState.selectedProtocolId;
      const accountLists = rootState.account.accountLists;

      let protocolListsWithSupportedTokensFromBE =
        accountState.protocolListsWithSupportedTokensFromBE;
      if (!protocolListsWithSupportedTokensFromBE) {
        protocolListsWithSupportedTokensFromBE = DefaultProtocolDataList;
      }

      const mnemonicExist = accountLists?.some((e) => e.mnemonic === mnemonic);

      if (mnemonicExist) {
        return rejectWithValue(undefined);
      }

      const protocolListsFromBE =
        protocolListsWithSupportedTokensFromBE ?? DefaultProtocolDataList;

      const isTestNet = getIsTestnet(rootState);
      const protocolData = await AccountUtils.generateProtocolData({
        mnemonic,
        generateDataProtocolListsFromBE: protocolListsFromBE,
        dispatch,
        isTestNet,
      });

      if (!protocolData) {
        return rejectWithValue(undefined);
      }

      const id = Utils.generateUniqueId();

      const accountIndex = accountLists?.length ?? 0;

      const newAccountLists: AccountType[] = [
        {
          name: `Account ${accountIndex + 1}`,
          mnemonic: mnemonic,
          id,
          protocolData: protocolData,
          avtColor: AccountUtils.getAvtColor(accountIndex),
          version: 1,
        },
        ...(accountLists ?? []),
      ];

      if (!selectedProtocolId) {
        const polProtocolData = protocolListsWithSupportedTokensFromBE?.find(
          (e) => e.slip0044 === Slip0044.Polygon
        );
        dispatch(
          setSelectedProtocol(
            polProtocolData ? polProtocolData._id : protocolData[0]?._id
          )
        );
      }
      dispatch(setSelectAccountId(id));

      const accountServices = new AccountServices();

      const resSaveWallet = await accountServices.saveAccountDataWithEncrypt(
        newAccountLists,
        pinCode
      );

      if (resSaveWallet) {
        return newAccountLists;
      } else {
        return rejectWithValue(undefined);
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// MARK: Remove account.
export const removeAccount = createAsyncThunk(
  "account/remove",
  async (account: AccountType, { dispatch, getState, rejectWithValue }) => {
    try {
      const rootState = getState() as RootState;
      const selectAccountId = rootState.account.selectAccountId;
      const pinCode = rootState.account.pin;
      const accountLists = rootState.account.accountLists ?? [];
      const remainWallets = [...accountLists].filter(
        (e) => e.mnemonic !== account.mnemonic
      );
      const isLastWallet = remainWallets.length === 0;

      if (isLastWallet) {
        const accountServices = new AccountServices();
        await accountServices.deleteAllAccountData();
        dispatch(setResetAction(true));
        return undefined;
      } else {
        if (account.id === selectAccountId) {
          const currentAccount = remainWallets[0];
          dispatch(setSelectAccountId(currentAccount.id));
        }
        dispatch(deleteEVMCollectionByAccount(account.id));
        dispatch(deleteTonCollectionByAccount(account.id));

        if (pinCode) {
          const accountServices = new AccountServices();
          const resSaveWallet =
            await accountServices.saveAccountDataWithEncrypt(
              remainWallets,
              pinCode
            );
          if (resSaveWallet) {
            return remainWallets;
          }
        }
        return rejectWithValue(null);
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
// MARK: Change wallet.
export const changWallet = createAsyncThunk(
  "account/changWallet",
  async (newSelectedAddressId: string, { getState, rejectWithValue }) => {
    console.log("newSelectedAddressId", newSelectedAddressId);
    try {
      const state = getState() as RootState;
      const accountState = state.account;
      const pinCode = accountState.pin;
      const accountLists = accountState.accountLists;
      const selectAccountId = accountState.selectAccountId;
      const currentAccount = [...(accountLists ?? [])].find(
        (e) => e.id === selectAccountId
      );
      if (!pinCode) {
        return rejectWithValue(undefined);
      }
      if (currentAccount !== undefined) {
        const accountProtocolData = currentAccount.protocolData;
        const selectedProtocolId = accountState.selectedProtocolId;
        const currentAccountProtocolData = [
          ...(accountProtocolData ?? []),
        ].find((e) => e._id === selectedProtocolId);
        if (
          currentAccountProtocolData !== undefined &&
          currentAccountProtocolData.selectedAddressId !== newSelectedAddressId
        ) {
          const newCurrentProtocolData: ProtocolDataType = {
            ...currentAccountProtocolData,
            selectedAddressId: newSelectedAddressId,
          };
          const newProtocolData = [...(accountProtocolData ?? [])].filter(
            (e) => e._id !== currentAccountProtocolData._id
          );
          newProtocolData.push(newCurrentProtocolData);

          const newAccountList = [...(accountLists ?? [])].filter(
            (e) => e.id !== selectAccountId
          );
          const newAccountData: AccountType = {
            ...currentAccount,
            protocolData: newProtocolData,
          };
          newAccountList.push(newAccountData);

          const accountServices = new AccountServices();
          const resSaveWallet =
            await accountServices.saveAccountDataWithEncrypt(
              newAccountList,
              pinCode
            );

          if (resSaveWallet) {
            return newAccountList;
          } else {
            return rejectWithValue(undefined);
          }
        } else {
          return rejectWithValue(undefined);
        }
      }
      return rejectWithValue(undefined);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addWallet = createAsyncThunk(
  "account/addWallet",
  async (walletIndex: number | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountState = state.account;
      const accountLists = accountState.accountLists;
      const protocolListsWithSupportedTokensFromBE =
        accountState.protocolListsWithSupportedTokensFromBE;
      const pinCode = accountState.pin;
      const selectAccountId = accountState.selectAccountId;
      const currentAccount = [...(accountLists ?? [])].find(
        (e) => e.id === selectAccountId
      );
      if (!currentAccount || !pinCode) {
        return rejectWithValue(undefined);
      }
      const protocolData = currentAccount.protocolData;
      const selectedProtocolId = accountState.selectedProtocolId;
      const currentProtocolData = [...(protocolData ?? [])].find(
        (e) => e._id === selectedProtocolId
      );
      const currentProtocolBaseData = [
        ...(protocolListsWithSupportedTokensFromBE ?? []),
      ].find((e) => e._id === selectedProtocolId);
      const addressList = currentProtocolData?.addressList;
      const slip0044 = currentProtocolBaseData?.slip0044;
      if (slip0044 === undefined || slip0044 === null || !addressList) {
        return rejectWithValue(undefined);
      }
      let walletIndexFind = null;
      for (let index = 0; index < 20000; index++) {
        const result = addressList.some((e) => e.index === index);
        if (!result) {
          walletIndexFind = index;

          break;
        }
      }
      const newAddressIndex = walletIndex ?? walletIndexFind;
      if (newAddressIndex == null) {
        return rejectWithValue(undefined);
      }
      const id = Utils.generateUniqueId();
      const newDerivationPath = AccountUtils.changeDerivationPath(
        appConstants.defaultDerivationPath,
        newAddressIndex
      );

      const nativeWalletCoreModule = new NativeWalletCoreModule();

      const isTestNet = getIsTestnet(state);

      const walletCoreCoinData =
        await nativeWalletCoreModule.getDataFromSlip0044({
          mnemonic: currentAccount.mnemonic,
          isTestNet,
          slip0044,
          derivationPath: newDerivationPath,
        });

      if (!walletCoreCoinData) {
        return rejectWithValue(undefined);
      }

      const newAddressListItem: AddressListItemType = {
        address: walletCoreCoinData?.address,
        privateKey: walletCoreCoinData?.privateKey,
        publicKey: walletCoreCoinData?.publicKey,
        index: newAddressIndex,
        path: newDerivationPath,
        id: id,
        name: `Wallet ${newAddressIndex + 1}`,
        avtColor: AccountUtils.getAvtColor(newAddressIndex),
      };

      const newAddressList = [...addressList];
      newAddressList.push(newAddressListItem);
      newAddressList.sort((a, b) => a.index - b.index);
      const newCurrentProtocolData: ProtocolDataType = {
        ...currentProtocolData,
        addressList: newAddressList,
        selectedAddressId: id,
      };
      const newProtocolData = [...(protocolData ?? [])].filter(
        (e) => e._id !== selectedProtocolId
      );
      newProtocolData.push(newCurrentProtocolData);

      const newAccountList = [...(accountLists ?? [])].filter(
        (e) => e.id !== selectAccountId
      );
      const newAccountData: AccountType = {
        ...currentAccount,
        protocolData: newProtocolData,
      };
      newAccountList.push(newAccountData);
      const accountServices = new AccountServices();
      const resSaveWallet = await accountServices.saveAccountDataWithEncrypt(
        newAccountList,
        pinCode
      );

      if (resSaveWallet) {
        return newAccountList;
      } else {
        return rejectWithValue(undefined);
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const removeWallet = createAsyncThunk(
  "account/removeWallet",
  async (wallet: AddressListItemType, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountState = state.account;
      const pinCode = accountState.pin;
      const accountLists = accountState.accountLists;
      const selectAccountId = accountState.selectAccountId;
      const currentAccount = [...(accountLists ?? [])].find(
        (e) => e.id === selectAccountId
      );
      if (!pinCode) {
        return rejectWithValue(undefined);
      }

      if (currentAccount !== undefined) {
        const accountProtocolData = currentAccount.protocolData;
        const selectedProtocolId = accountState.selectedProtocolId;

        const currentAccountProtocolData = [
          ...(accountProtocolData ?? []),
        ].find((e) => e._id === selectedProtocolId);

        if (currentAccountProtocolData !== undefined) {
          const restAddressList = [
            ...currentAccountProtocolData.addressList,
          ].filter((e) => e.id !== wallet.id);

          if (restAddressList?.length === 0) {
            return rejectWithValue(undefined);
          }

          const currentSelectedAddressId =
            currentAccountProtocolData.selectedAddressId;

          const newSelectedAddressId =
            currentSelectedAddressId === wallet.id
              ? restAddressList[0].id
              : currentSelectedAddressId;

          const newCurrentProtocolData: ProtocolDataType = {
            ...currentAccountProtocolData,
            selectedAddressId: newSelectedAddressId,
            addressList: restAddressList,
          };
          const newProtocolData = [...(accountProtocolData ?? [])].filter(
            (e) => e._id !== currentAccountProtocolData._id
          );
          newProtocolData.push(newCurrentProtocolData);

          const newAccountList = [...(accountLists ?? [])].filter(
            (e) => e.id !== selectAccountId
          );
          const newAccountData: AccountType = {
            ...currentAccount,
            protocolData: newProtocolData,
          };
          newAccountList.push(newAccountData);

          const accountServices = new AccountServices();
          const resSaveWallet =
            await accountServices.saveAccountDataWithEncrypt(
              newAccountList,
              pinCode
            );

          if (resSaveWallet) {
            return newAccountList;
          } else {
            return rejectWithValue(undefined);
          }
        }
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const editWallet = createAsyncThunk(
  "account/editWallet",
  async (wallet: AddressListItemType, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountState = state.account;
      const pinCode = accountState.pin;
      const accountLists = accountState.accountLists;
      const selectAccountId = accountState.selectAccountId;
      const currentAccount = [...(accountLists ?? [])].find(
        (e) => e.id === selectAccountId
      );
      if (!pinCode) {
        return;
      }
      if (currentAccount !== undefined) {
        const accountProtocolData = currentAccount.protocolData;
        const selectedProtocolId = accountState.selectedProtocolId;
        const currentAccountProtocolData = [
          ...(accountProtocolData ?? []),
        ].find((e) => e._id === selectedProtocolId);
        if (currentAccountProtocolData !== undefined) {
          const restAddressList = [
            ...currentAccountProtocolData.addressList,
          ].filter((e) => e.id !== wallet.id);

          restAddressList.push(wallet);

          restAddressList.sort((a, b) => a.index - b.index);

          const newCurrentProtocolData: ProtocolDataType = {
            ...currentAccountProtocolData,
            addressList: restAddressList,
          };
          const newProtocolData = [...(accountProtocolData ?? [])].filter(
            (e) => e._id !== currentAccountProtocolData._id
          );
          newProtocolData.push(newCurrentProtocolData);

          const newAccountList = [...(accountLists ?? [])].filter(
            (e) => e.id !== selectAccountId
          );
          const newAccountData: AccountType = {
            ...currentAccount,
            protocolData: newProtocolData,
          };
          newAccountList.push(newAccountData);

          const accountServices = new AccountServices();
          const resSaveWallet =
            await accountServices.saveAccountDataWithEncrypt(
              newAccountList,
              pinCode
            );

          if (resSaveWallet) {
            return newAccountList;
          } else {
            return undefined;
          }
        }
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


// MARK: Change PIN Code
export const changePinCode = createAsyncThunk(
  "account/changePinCode",
  async ({ pinCode }: { pinCode: string }, { getState, rejectWithValue }) => {
    try {
      const rootState = getState() as RootState;
      const accountLists = rootState.account.accountLists;
      const accountServices = new AccountServices();
      if (accountLists == null) {
        return rejectWithValue(null);
      }
      const res = await accountServices.saveAccountDataWithEncrypt(
        accountLists,
        pinCode
      );
      return res ? pinCode : rejectWithValue(null);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const accountSlice = createSlice({
  name: "accountSlice",
  initialState: initialState,
  reducers: {
    setSelectedProtocol: (state, action: PayloadAction<string>) => {
      state.selectedProtocolId = action.payload;
    },
    setPin: (state, action: PayloadAction<string | null>) => {
      state.pin = action.payload;
    },
    setAccount: (state, action: PayloadAction<AccountType[]>) => {
      state.accountLists = action.payload;
    },
    setTemporaryMnemonic: (state, action: PayloadAction<string>) => {
      state.temporaryMnemonic = action.payload;
    },
    setProtocolListsWithSupportedTokensFromBE: (
      state,
      action: PayloadAction<ProtocolDataWithSupportedTokensFormBEType[]>
    ) => {
      state.protocolListsWithSupportedTokensFromBE = action.payload;
    },
    setResetAction: (state, action: PayloadAction<boolean>) => {
      state.resetAction = action.payload;
    },
    setSelectAccountId: (state, action: PayloadAction<string>) => {
      state.selectAccountId = action.payload;
    },
    lockAccount: (state) => {
      state.pin = null;
      state.accountLists = undefined;
      state.temporaryMnemonic = null;
    },
    resetWalletSlice: () => initialState,
  },
  extraReducers: (build) => {
    build
      .addCase(getMobileProtocolLists.pending, (state) => {
        state.error = undefined;
      })
      .addCase(getMobileProtocolLists.fulfilled, (state, action) => {
        if (action.payload) {
          const protocolListsFromBE = action.payload;
          state.protocolListsFromBE = protocolListsFromBE;
        }
      })
      .addCase(getMobileProtocolListsWithSupportedTokens.pending, (state) => {
        state.error = undefined;
      })
      .addCase(
        getMobileProtocolListsWithSupportedTokens.fulfilled,
        (state, action) => {
          const payload = action.payload;
          if (payload) {
            state.protocolListsWithSupportedTokensFromBE = payload;

            // Fix: Check if current selected protocol still exists in the new list
            const stillExists = payload.some(p => p._id === state.selectedProtocolId);
            if (!stillExists && payload.length > 0) {
              // Priority: Polygon -> First one
              const polygon = payload.find(p => p.slip0044 === Slip0044.Polygon);
              state.selectedProtocolId = polygon ? polygon._id : payload[0]._id;
            } else if (payload.length === 0) {
              state.selectedProtocolId = undefined;
            }
          }
        }
      )
      .addCase(getMobileProtocolLists.rejected, () => {
        Utils.showToast({
          type: AppToastType.error,
          msg: "Get list protocol error",
        });
      })
      .addCase(
        removeAccount.fulfilled,
        (state, action: PayloadAction<AccountType[] | undefined>) => {
          const accountLists = action.payload;
          state.accountLists = accountLists;
        }
      )
      .addCase(
        editAccount.fulfilled,
        (state, action: PayloadAction<AccountType[] | undefined>) => {
          const accountLists = action.payload;
          state.accountLists = accountLists;
        }
      )
      .addCase(addAccount.pending, (state) => {
        state.temporaryMnemonic = null;
      })
      .addCase(
        addAccount.fulfilled,
        (state, action: PayloadAction<AccountType[] | undefined>) => {
          const accountLists = action.payload;
          state.accountLists = accountLists;
        }
      )
      .addCase(addAccount.rejected, () => {
        Utils.showToast({
          type: AppToastType.error,
          msg: "Add wallet error",
        });
      })
      .addCase(
        changWallet.fulfilled,
        (state, action: PayloadAction<AccountType[] | undefined>) => {
          state.accountLists = action.payload;
        }
      )
      .addCase(
        addWallet.fulfilled,
        (state, action: PayloadAction<AccountType[] | undefined>) => {
          state.accountLists = action.payload;
        }
      )
      .addCase(
        editWallet.fulfilled,
        (state, action: PayloadAction<AccountType[] | undefined>) => {
          state.accountLists = action.payload;
        }
      )
      .addCase(
        removeWallet.fulfilled,
        (state, action: PayloadAction<AccountType[] | undefined>) => {
          state.accountLists = action.payload;
        }
      )
      .addCase(
        changePinCode.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.pin = action.payload;
        }
      );
  },
});

export const {
  setSelectedProtocol,
  setSelectAccountId,
  setAccount,
  setTemporaryMnemonic,
  setPin,
  lockAccount,
  resetWalletSlice,
  setProtocolListsWithSupportedTokensFromBE,
  setResetAction,
} = accountSlice.actions;

export const getSelectedProtocolId = (state: RootState) =>
  state?.account?.selectedProtocolId;
export const getTemporaryMnemonic = (state: RootState) => {
  return state?.account?.temporaryMnemonic;
};
export const getAccountId = (state: RootState) => {
  return state?.account?.selectAccountId;
};
export const getAllAccount = (state: RootState) => {
  return state?.account?.accountLists;
};
export const getPin = (state: RootState) => state?.account?.pin;
export const getProtocolListsFromBE = (state: RootState) =>
  state?.account?.protocolListsFromBE;
export const getAccountState = (state: RootState) => state?.account;
export const getProtocolFromBE = (state: RootState) =>
  state?.account?.protocolListsFromBE;
export const getResetAction = (state: RootState) => state?.account?.resetAction;
export const selectorProtocolListsWithSupportedTokensFromBE = (state: RootState) =>
  state?.account?.protocolListsWithSupportedTokensFromBE;

export const selectorFilteredProtocolListsWithSupportedTokens = createSelector(
  [selectorProtocolListsWithSupportedTokensFromBE, getIsTestnet],
  (protocols, isTestnet) => {
    if (!protocols) return [];
    // Nếu bật Testnet: hiện tất cả. Nếu không: chỉ hiện mạng Mainnet (isTestnet = false/null)
    if (isTestnet) {
      return protocols;
    }
    return protocols.filter(p => !p.isTestnet);
  }
);
export const getProtocolDataLists = (state: RootState) => {
  return selectorFilteredProtocolListsWithSupportedTokens(state);
};

const ProtocolListConfig = {
  key: ReduxKey.account,
  storage: AsyncStorage,
  blacklist: ["pin", "accountLists", "temporaryMnemonic"],
};

const accountSliceReducer = persistReducer(
  ProtocolListConfig,
  accountSlice.reducer
);

export default accountSliceReducer;
