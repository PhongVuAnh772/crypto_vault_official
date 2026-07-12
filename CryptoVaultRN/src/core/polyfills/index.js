import { Buffer } from "@craftzdog/react-native-buffer";
import process from "process";
import { NativeModules } from 'react-native';
import { toByteArray, fromByteArray } from 'react-native-quick-base64';
import * as base64JS from 'base64-js';
global.Buffer = Buffer;
global.process = process;

// Fix for some libraries that check for Buffer on window/global
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Base64 -> ArrayBuffer
if (typeof global.base64ToArrayBuffer === "undefined") {
  global.base64ToArrayBuffer = (base64) => {
    if (!base64) return new ArrayBuffer(0);
    try {
      const arr = toByteArray(base64);
      return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
    } catch (e) {
      const arr = base64JS.toByteArray(base64);
      return arr.buffer;
    }
  };
}

// ArrayBuffer -> Base64
if (typeof global.base64FromArrayBuffer === "undefined") {
  global.base64FromArrayBuffer = (arrayBuffer) => {
    if (!arrayBuffer) return '';
    try {
      return fromByteArray(new Uint8Array(arrayBuffer));
    } catch (e) {
      return base64JS.fromByteArray(new Uint8Array(arrayBuffer));
    }
  };
}

// Polyfill atob
if (typeof global.atob === "undefined") {
  global.atob = (b64) => {
    if (!b64) return '';
    return Buffer.from(b64, 'base64').toString('binary');
  };
}

// Polyfill btoa
if (typeof global.btoa === "undefined") {
  global.btoa = (bin) => {
    if (!bin) return '';
    return Buffer.from(bin, 'binary').toString('base64');
  };
}

// Wrap TextDecoder to handle unsupported 'fatal' option in Hermes
let currentTextDecoder = globalThis.TextDecoder;

function wrapTextDecoder(OriginalTextDecoder) {
  if (!OriginalTextDecoder) return OriginalTextDecoder;
  if (OriginalTextDecoder.__isWrapped) return OriginalTextDecoder;

  class WrappedTextDecoder extends OriginalTextDecoder {
    constructor(label, options) {
      if (options && options.fatal) {
        const { fatal, ...rest } = options;
        super(label, rest);
      } else {
        super(label, options);
      }
    }
    decode(input, options) {
      if (input === undefined || input === null) {
        return super.decode(new Uint8Array(0), options);
      }
      return super.decode(input, options);
    }
  }
  WrappedTextDecoder.__isWrapped = true;
  return WrappedTextDecoder;
}

if (currentTextDecoder) {
  currentTextDecoder = wrapTextDecoder(currentTextDecoder);
}

Object.defineProperty(globalThis, 'TextDecoder', {
  get() {
    return currentTextDecoder;
  },
  set(val) {
    currentTextDecoder = wrapTextDecoder(val);
  },
  configurable: true,
});

Object.defineProperty(global, 'TextDecoder', {
  get() {
    return currentTextDecoder;
  },
  set(val) {
    currentTextDecoder = wrapTextDecoder(val);
  },
  configurable: true,
});

