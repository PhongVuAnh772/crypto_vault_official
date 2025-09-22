const getRemoteRedXNewTheme = (): boolean => (global as any).remoteRedXNewTheme;
const setRemoteRedXNewTheme = (value: boolean) =>
    ((global as any).remoteRedXNewTheme = value);

const getUseRemoteThemeConfig = (): boolean =>
    (global as any).useRemoteThemeConfig;
const setUseRemoteThemeConfig = (value: boolean) =>
    ((global as any).useRemoteThemeConfig = value);

const getEnableRedXNewTheme = (): boolean => {
    const localConfig = (global as any).redXNewTheme;
    const remoteConfig = getRemoteRedXNewTheme();

    const useRemoteConfig = getUseRemoteThemeConfig();
    return useRemoteConfig ? remoteConfig : localConfig;
};

const GlobalUtils = {
    getEnableRedXNewTheme,
    getRemoteRedXNewTheme,
    getUseRemoteThemeConfig,
    setRemoteRedXNewTheme,
    setUseRemoteThemeConfig,
};

export default GlobalUtils;
