const getRemoteledgerifyNewTheme = (): boolean => (global as any).remoteledgerifyNewTheme;
const setRemoteledgerifyNewTheme = (value: boolean) =>
    ((global as any).remoteledgerifyNewTheme = value);

const getUseRemoteThemeConfig = (): boolean =>
    (global as any).useRemoteThemeConfig;
const setUseRemoteThemeConfig = (value: boolean) =>
    ((global as any).useRemoteThemeConfig = value);

const getEnableledgerifyNewTheme = (): boolean => {
    const localConfig = (global as any).ledgerifyNewTheme;
    const remoteConfig = getRemoteledgerifyNewTheme();

    const useRemoteConfig = getUseRemoteThemeConfig();
    return useRemoteConfig ? remoteConfig : localConfig;
};

const GlobalUtils = {
    getEnableledgerifyNewTheme,
    getRemoteledgerifyNewTheme,
    getUseRemoteThemeConfig,
    setRemoteledgerifyNewTheme,
    setUseRemoteThemeConfig,
};

export default GlobalUtils;
