import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from 'src/core/constants/config';

const AUTH_TOKEN_KEY = 'marketplace_auth_token';

export const marketplaceSession = {
  async getToken() {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },
  async setToken(token: string) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  async clear() {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  auth?: boolean;
};

export const requestApi = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, auth = false } = options;
  const token = auth ? await marketplaceSession.getToken() : null;
  const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed: ${path}`);
  }
  return payload as T;
};

