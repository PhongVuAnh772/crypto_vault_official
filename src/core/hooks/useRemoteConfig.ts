import { useEffect } from "react";
import { useAppDispatch } from "src/core/redux/hooks";
import { setAppConfig, setLoading, setError } from "src/core/redux/slice/appConfig.slice";

// In reality, this would be your server IP or a public URL.
const CONFIG_URL = "http://localhost:3000/api/v1/config";

const useRemoteConfig = () => {
  const dispatch = useAppDispatch();

  const fetchConfig = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(CONFIG_URL);
      const data = await response.json();
      
      if (data) {
        dispatch(setAppConfig(data));
      }
    } catch (err) {
      console.log("Failed to fetch remote config:", err);
      dispatch(setError("Network error"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return { refreshConfig: fetchConfig };
};

export default useRemoteConfig;
