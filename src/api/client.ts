import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import ApiConstants from '../core/constants/ApiConstants';

export const apiClient = axios.create({
  baseURL: ApiConstants.SERVER_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    // Tích hợp an toàn bảo mật để lấy JWT token mà Mobile User dùng đăng nhập (Nếu có Auth)
    const credentials = await Keychain.getGenericPassword({ service: 'user_auth' });
    if (credentials && credentials.password) {
      config.headers.Authorization = `Bearer ${credentials.password}`;
    }
  } catch (error) {
    console.warn("Lỗi khi đọc token từ Keychain", error);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu Backend phản hồi 401 thì bắn Global event báo văng phiên (Logout)
    if (error.response?.status === 401) {
      console.error('Session Token Expired. Must relogin.');
      // Viết logic dispatch logout ở đây
    }
    // Chuẩn hoá lỗi cho Thunk catch dễ xử lý
    return Promise.reject(error.response?.data?.error || 'Network Error from Backend API');
  }
);
