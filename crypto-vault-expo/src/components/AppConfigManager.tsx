import React, { useEffect } from 'react';
import { useAppDispatch } from 'src/core/redux/hooks';
import { setAppConfig, setLoading, setError } from 'src/core/redux/slice/appConfig.slice';
import { fetchAppRemoteConfig } from 'src/core/services/supabase/supabase.config';

/**
 * Thành phần ẩn để quản lý và fetch Remote Config từ Supabase
 */
const AppConfigManager: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initConfig = async () => {
      try {
        dispatch(setLoading(true));
        const config = await fetchAppRemoteConfig();
        
        if (config) {
          dispatch(setAppConfig(config));
        }
      } catch (err) {
        console.error('Remote Config sync error:', err);
        dispatch(setError('Failed to sync with Supabase'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    initConfig();
  }, [dispatch]);

  return null; // Không render giao diện
};

export default AppConfigManager;
