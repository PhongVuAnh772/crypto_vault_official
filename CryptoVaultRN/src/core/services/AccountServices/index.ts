import { AccountType } from 'src/core/redux/slice/account.type';
import EncryptAES from '../EncryptAES';
import SecureStorage from '../SecureStorage';
import SecureStorageKey from 'src/core/enum/SecureStorageKey';
import AccountUtils from 'src/core/utils/accountUtils';
import { AccountEncryptedType } from 'src/core/redux/slice/type';

class AccountServices {
    encryptAES: EncryptAES;
    constructor() {
        this.encryptAES = new EncryptAES();
    }

    deleteAllAccountData = async () => {
        await SecureStorage.clear();
    };

    /**
     * Get or create a master key for the user.
     * The master key is encrypted with a key derived from the PIN.
     */
    getDecryptedMasterKey = async (pinCode: string): Promise<string | undefined> => {
        try {
            const encryptedMasterKey = (await SecureStorage.getObject(SecureStorageKey.masterKey)) as AccountEncryptedType | null;
            const salt = (await SecureStorage.getItem(SecureStorageKey.salt)) as string | null;

            if (!encryptedMasterKey || !salt) {
                return undefined;
            }

            // 1. Derive key from PIN using stored salt and 100k iterations
            const pinDerivedKey = await this.encryptAES.generateKey(pinCode, salt);

            // 2. Decrypt Master Key using the PIN-derived key
            const masterKey = await this.encryptAES.decryptTextWithKey(encryptedMasterKey, pinDerivedKey);
            
            return masterKey;
        } catch (error: any) {
            // "Decrypt failed" usually means the PIN is wrong or the data was encrypted with a different key.
            if (error?.message === 'Decrypt failed') {
                console.warn('getDecryptedMasterKey: Decryption failed (likely wrong PIN).');
            } else {
                console.error('getDecryptedMasterKey Unexpected Error:', error);
            }
            return undefined;
        }
    };

    /**
     * Initialize security: Create Salt and Master Key, then encrypt Master Key with PIN
     */
    initializeSecurity = async (pinCode: string): Promise<string | undefined> => {
        try {
            const salt = await this.encryptAES.generateRandomSalt();
            const masterKey = await this.encryptAES.generateRandomKey();

            // 1. Derive key from PIN using new random salt
            const pinDerivedKey = await this.encryptAES.generateKey(pinCode, salt);

            // 2. Encrypt Master Key with PIN-derived key
            const encryptedMasterKey = await this.encryptAES.encryptTextWithKey(masterKey, pinDerivedKey);

            // 3. Save Salt and Encrypted Master Key
            await SecureStorage.setKey(SecureStorageKey.salt, salt);
            await SecureStorage.setObject(SecureStorageKey.masterKey, encryptedMasterKey);

            return masterKey;
        } catch (error) {
            console.error('initializeSecurity Error:', error);
            return undefined;
        }
    };

    saveAccountDataWithEncrypt = async (
        accountData: AccountType[],
        pinCode: string,
    ): Promise<boolean> => {
        try {
            const checkAccountData = AccountUtils.checkAccountType(accountData);
            if (!checkAccountData) return false;

            // 1. Get or Initialize Master Key
            let masterKey = await this.getDecryptedMasterKey(pinCode);
            if (!masterKey) {
                // If not found, it might be the first time setting the PIN
                masterKey = await this.initializeSecurity(pinCode);
            }

            if (!masterKey) return false;

            // 2. Encrypt Account Data with Master Key
            const encryptData = await this.encryptAES.encryptObject(
                accountData,
                masterKey,
            );

            // 3. Save Encrypted Account Data
            await SecureStorage.setObject(
                SecureStorageKey.accounts,
                encryptData,
            );
            return true;
        } catch (error) {
            console.log('saveAccountDataWithEncrypt Error:', error);
            return false;
        }
    };

    getAccountDataWithEncrypt = async (
        pinCode: string,
    ): Promise<AccountType[] | undefined> => {
        try {
            const accountEncryptedData =
                (await SecureStorage.getObject(SecureStorageKey.accounts)) as AccountEncryptedType | null ??
                (await SecureStorage.getObject(SecureStorageKey.wallets)) as AccountEncryptedType | null;
            
            if (!accountEncryptedData) return undefined;

            // 1. Unlock Master Key with PIN
            const masterKey = await this.getDecryptedMasterKey(pinCode);
            if (!masterKey) return undefined;

            // 2. Decrypt Account Data with Master Key
            const accountsData = await this.encryptAES.decryptObject(
                accountEncryptedData,
                masterKey,
            );

            const checkAccountsDataResult = AccountUtils.checkAccountType(accountsData);

            if (checkAccountsDataResult) {
                return accountsData;
            }
            return undefined;
        } catch (error) {
            console.log('getAccountDataWithEncrypt Error:', error);
            return undefined;
        }
    };

    checkPinCode = async (pinCode: string): Promise<boolean> => {
        try {
            // Check if we can unlock the Master Key with this PIN
            const masterKey = await this.getDecryptedMasterKey(pinCode);
            return !!masterKey;
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
            const accountsData = await this.getAccountDataWithEncrypt(pinCode);
            if (accountsData) {
                return accountsData.find(account => account.id === currentAccountId);
            }
        } catch (error) {
            console.log('getCurrentAccount Error:', error);
        }
    };
}

export default AccountServices;
