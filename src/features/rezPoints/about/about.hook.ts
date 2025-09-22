import { useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import WebView from 'react-native-webview';
import EnvConfig from 'src/core/constants/EnvConfig';

const useAboutRezPoint = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const webViewRef = useRef<WebView>(null);

    const showLoading = () => setLoading(true);
    const hideLoading = () => setLoading(false);
    const handleNavigation = (event: any) => {
        if (!event?.url) {
            return false;
        }
        if (
            event.url === EnvConfig.REZ_POINT_HOME ||
            event.url === EnvConfig.REZ_POINT_HOME.slice(0, -1)
        ) {
            Linking.openURL(event.url);
            return false;
        }
        return true;
    };

    useEffect(() => {
        if (webViewRef.current && webViewRef.current?.clearCache) {
            webViewRef.current?.clearCache(true);
        }
    }, []);
    return {
        loading,
        showLoading,
        hideLoading,
        handleNavigation,
        webViewRef,
    };
};
export default useAboutRezPoint;
