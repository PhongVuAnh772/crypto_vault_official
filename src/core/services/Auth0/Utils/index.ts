import * as Crypto from 'expo-crypto';
import {Platform} from 'react-native';
import EnvConfig from 'src/core/constants/EnvConfig';

async function generateSecureCode(length?: number): Promise<string> {
    const bytes = await Crypto.getRandomBytesAsync(length ?? 32);
    return Array.from(bytes)
        .map((byte: number) => ('0' + byte.toString(16)).slice(-2))
        .join('');
}

async function generatePKCEValues() {
    const verifier = await generateSecureCode();

    const challenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        verifier,
        {
            encoding: Crypto.CryptoEncoding.BASE64,
        },
    );

    return {verifier, challenge};
}
function getCallbackURL(): string {
    return Platform.OS === 'ios'
        ? EnvConfig.AUTH0_CALLBACK_URL_IOS
        : EnvConfig.AUTH0_CALLBACK_URL_ANDROID;
}

export {generatePKCEValues, generateSecureCode, getCallbackURL};
