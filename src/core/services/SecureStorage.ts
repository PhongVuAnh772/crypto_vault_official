import RNSecureStorage, { ACCESSIBLE } from "rn-secure-storage";
import SecureStorageKey from "src/core/enum/SecureStorageKey";

const setKey = async (key: SecureStorageKey | string, value: string) => {
  return await RNSecureStorage.setItem(key, value, {
    accessible: ACCESSIBLE.WHEN_UNLOCKED,
  })
    .then((res) => {
      console.log(`Set Item "${key}" =>`, res);
    })
    .catch((err) => {
      console.log(`Set Item "${key}" error =>`, err);
    });
};

const getItem: (
  key: SecureStorageKey | string
) => Promise<string | null> = async (key: SecureStorageKey | string) => {
  return await RNSecureStorage.getItem(key)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log(`Get Item "${key}" error =>`, err);
      return null;
    });
};

const setObject = async (key: SecureStorageKey | string, value: object) => {
  try {
    return await RNSecureStorage.setItem(key, JSON.stringify(value), {
      accessible: ACCESSIBLE.WHEN_UNLOCKED,
    })
      .then((res) => {
        console.log(`Set Object "${key}" =>`, res);
      })
      .catch((err) => {
        console.log(`Set Object "${key}" error =>`, err);
      });
  } catch (error) {
    console.log(`Set Object "${key}" error =>`, error);
  }
};

const getObject: (
  key: SecureStorageKey | string
) => Promise<object | null> = async (key: SecureStorageKey | string) => {
  return await RNSecureStorage.getItem(key)
    .then((res) => {
      try {
        const parseRes = res !== null ? JSON.parse(res) : res;
        return parseRes;
      } catch (error) {
        console.error("Get Object Error:", error);
        return null;
      }
    })
    .catch((err) => {
      console.log(`Get Object "${key}" error =>`, err);
      return null;
    });
};

const removeItem = async (key: SecureStorageKey | string) => {
  return await RNSecureStorage.removeItem(key)
    .then((res) => {
      console.log(`Remove Item "${key}" success =>`, res);
    })
    .catch((err) => {
      console.log(`Remove Item "${key}" error =>`, err);
    });
};

const clear = async () => {
  return await RNSecureStorage.clear()
    .then((res) => {
      console.log("Clear success:", res);
    })
    .catch((err) => {
      console.log("Clear error:", err);
    });
};

export default { setKey, getItem, removeItem, clear, setObject, getObject };
