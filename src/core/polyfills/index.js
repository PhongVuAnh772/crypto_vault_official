// src/polyfills.js
import { Buffer } from "buffer";

// Base64 -> ArrayBuffer
if (typeof global.base64ToArrayBuffer === "undefined") {
  global.base64ToArrayBuffer = (base64) => {
    const binary_string = Buffer.from(base64, "base64").toString("binary");
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  };
}

// ArrayBuffer -> Base64
if (typeof global.base64FromArrayBuffer === "undefined") {
  global.base64FromArrayBuffer = (arrayBuffer) => {
    return Buffer.from(arrayBuffer).toString("base64");
  };
}

// Polyfill atob
if (typeof global.atob === "undefined") {
  global.atob = (b64) => Buffer.from(b64, "base64").toString("binary");
}

// Polyfill btoa
if (typeof global.btoa === "undefined") {
  global.btoa = (bin) => Buffer.from(bin, "binary").toString("base64");
}
