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
    generateKey = (password: string) =>
        Aes.pbkdf2(password, 'ledgerify', 5000, 256, 'sha256');

    encryptText = async (text: string, key: string) => {
        const keyAes = await this.generateKey(key);
        const iv = await Aes.randomKey(16);
        const cipher = await Aes.encrypt(text, keyAes, iv, 'aes-256-cbc');
        return {
            cipher,
            iv,
        };
    };

    decryptText = async (
        encryptedData: {
            cipher: string;
            iv: string;
        },
        key: string,
    ) => {
        const checkData = this.isAccountEncryptedType(encryptedData);
        const keyAes = await this.generateKey(key);
        if (checkData) {
            const res = Aes.decrypt(
                encryptedData.cipher,
                keyAes,
                encryptedData.iv,
                'aes-256-cbc',
            );

            return res;
        } else {
            return undefined;
        }
    };

    encryptObject = async (value: object, key: string) => {
        const stringValue: string = JSON.stringify(value);

        return this.encryptText(stringValue, key);
    };

    decryptObject = async (
        encryptedData: AccountEncryptedType,
        key: string,
    ) => {
        const checkTypeData = this.isAccountEncryptedType(encryptedData);
        if (checkTypeData) {
            const decryptDataRes = await this.decryptText(encryptedData, key);
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
