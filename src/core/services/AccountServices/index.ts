import {AccountType} from 'src/core/redux/slice/account.type';
import EncryptAES from '../EncryptAES';
import SecureStorage from '../SecureStorage';
import SecureStorageKey from 'src/core/enum/SecureStorageKey';
import AccountUtils from 'src/core/utils/accountUtils';

class AccountServices {
    encryptAES: EncryptAES;
    constructor() {
        this.encryptAES = new EncryptAES();
    }

    deleteAllAccountData = async () => {
        await SecureStorage.clear();
    };

    saveAccountDataWithEncrypt = async (
        accountData: AccountType[],
        pinCode: string,
    ): Promise<boolean> => {
        try {
            const checkAccountData = AccountUtils.checkAccountType(accountData);
            if (checkAccountData) {
                const encryptData = await this.encryptAES.encryptObject(
                    accountData,
                    pinCode,
                );
                await SecureStorage.setObject(
                    SecureStorageKey.accounts,
                    encryptData,
                );
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log('saveAccountDataWithEncrypt Error:', error);
            console.log('===================================================');
            return false;
        }
    };

    getAccountDataWithEncrypt = async (
        pinCode: string,
    ): Promise<AccountType[] | undefined> => {
        try {
            const accountEncryptedData =
                (await SecureStorage.getObject(SecureStorageKey.accounts)) ??
                (await SecureStorage.getObject(SecureStorageKey.wallets));
            if (this.encryptAES.isAccountEncryptedType(accountEncryptedData)) {
                const accountsData = await this.encryptAES.decryptObject(
                    accountEncryptedData,
                    pinCode,
                );
                const checkAccountsDataResult =
                    AccountUtils.checkAccountType(accountsData);

                if (checkAccountsDataResult) {
                    return accountsData;
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        } catch (error) {
            console.log('getAccountDataWithEncrypt Error:', error);
            console.log('===================================================');
            return undefined;
        }
    };

    checkPinCode = async (pinCode: string): Promise<boolean> => {
        try {
            const accountEncryptedData =
                (await SecureStorage.getObject(SecureStorageKey.accounts)) ??
                (await SecureStorage.getObject(SecureStorageKey.wallets));

            if (this.encryptAES.isAccountEncryptedType(accountEncryptedData)) {
                const encryptAES = new EncryptAES();
                const accountsData = (await encryptAES.decryptObject(
                    accountEncryptedData,
                    pinCode,
                )) as AccountType[];

                return !!accountsData;
            } else {
                return false;
            }
        } catch (error) {
            console.error('checkPinCode Error:', error);
            return false;
        }
    };

    getCurrentAccount = async (
        pinCode: string,
        currentAccountId: string,
    ): Promise<AccountType | undefined> => {
        try {
            const accountEncryptedData = await SecureStorage.getObject(
                SecureStorageKey.accounts,
            );
            if (this.encryptAES.isAccountEncryptedType(accountEncryptedData)) {
                const encryptAES = new EncryptAES();
                const accountsData: AccountType[] =
                    await encryptAES.decryptObject(
                        accountEncryptedData,
                        pinCode,
                    );

                const currentAccount = accountsData.find(
                    account => account.id === currentAccountId,
                );
                return currentAccount;
            }
        } catch (error) {
            console.log(
                '🚀 ~ AccountServices ~ getCurrentAccount ~ error:',
                error,
            );
        }
    };
}

export default AccountServices;
