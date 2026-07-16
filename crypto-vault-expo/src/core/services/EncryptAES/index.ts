import Aes from 'react-native-aes-crypto';
import { AccountEncryptedType } from 'src/core/redux/slice/type';

class EncryptAES {
    isAccountEncryptedType = (
        variable: any,
    ): variable is AccountEncryptedType => {
        return (
            variable &&
            typeof variable === 'object' &&
            typeof variable.cipher === 'string' &&
            typeof variable.iv === 'string'
        );
    };

    /**
     * Generate a key using PBKDF2
     * @param password PIN or passphrase
     * @param salt Unique salt per user
     * @returns Derived key
     */
    generateKey = (password: string, salt: string) =>
        Aes.pbkdf2(password, salt, 100000, 256, 'sha256');

    /**
     * Generate a random master key
     * @returns 32-byte random key
     */
    generateRandomKey = async () => {
        return await Aes.randomKey(32);
    };

    /**
     * Generate a random salt
     * @returns 16-byte random salt
     */
    generateRandomSalt = async () => {
        return await Aes.randomKey(16);
    };

    /**
     * Encrypt text using a technical key (already derived or master key)
     */
    encryptTextWithKey = async (text: string, technicalKey: string) => {
        const iv = await Aes.randomKey(16);
        const cipher = await Aes.encrypt(text, technicalKey, iv, 'aes-256-cbc');
        return {
            cipher,
            iv,
        };
    };

    /**
     * Decrypt text using a technical key
     */
    decryptTextWithKey = async (
        encryptedData: {
            cipher: string;
            iv: string;
        },
        technicalKey: string,
    ) => {
        const checkData = this.isAccountEncryptedType(encryptedData);
        if (checkData) {
            const res = Aes.decrypt(
                encryptedData.cipher,
                technicalKey,
                encryptedData.iv,
                'aes-256-cbc',
            );

            return res;
        } else {
            return undefined;
        }
    };

    encryptObject = async (value: object, technicalKey: string) => {
        const stringValue: string = JSON.stringify(value);
        return this.encryptTextWithKey(stringValue, technicalKey);
    };

    decryptObject = async (
        encryptedData: AccountEncryptedType,
        technicalKey: string,
    ) => {
        const checkTypeData = this.isAccountEncryptedType(encryptedData);
        if (checkTypeData) {
            const decryptDataRes = await this.decryptTextWithKey(encryptedData, technicalKey);
            if (decryptDataRes) {
                return JSON.parse(decryptDataRes);
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    };
}

export default EncryptAES;
