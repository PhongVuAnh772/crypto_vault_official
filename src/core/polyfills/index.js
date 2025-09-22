// src/polyfills.js
import { Buffer } from 'buffer';

if (typeof global.base64ToArrayBuffer === 'undefined') {
    global.base64ToArrayBuffer = base64 => {
        // This is the most reliable method for converting Base64 to ArrayBuffer
        // across different environments (Node.js, browser, React Native).
        const binary_string = Buffer.from(base64, 'base64').toString('binary');
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    };
}
