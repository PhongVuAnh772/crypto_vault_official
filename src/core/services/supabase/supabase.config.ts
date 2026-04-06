import { createClient } from '@supabase/supabase-js';
import ApiConstants from 'src/core/constants/ApiConstants';

// Giữ lại Supabase client cho các tính năng Direct DB khác nếu cần
const SUPABASE_URL = 'https://zmsgkyiqikhtwwsjhoxn.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Service lấy cấu hình từ SERVER (Server sẽ thay mặt app truy vấn Supabase)
 * Điều này giúp bảo mật hơn và quản lý logic tập trung tại Backend.
 */
export const fetchAppRemoteConfig = async () => {
  try {
    const response = await fetch(`${ApiConstants.SERVER_URL}/api/v1/config`);
    if (!response.ok) {
      throw new Error('Server response was not ok');
    }
    
    const config = await response.json();
    return config;
  } catch (error) {
    console.error('Fetch Config from Server error:', error);
    return null;
  }
};
