import remoteConfig from '@react-native-firebase/remote-config';
import RemoteConfigKey from '../enum/RemoteConfigKey';
import {
    setBlockBitcoinTransfer,
    setBlockJettonTransfer,
    setBlockTonNftTransfer,
    setBlockTonTransfer,
    setForceUpdate,
    setJettonAdminBounce,
    setMinFeeForJettonTransfer,
    setRemoteConfigAppVersion,
    setTonAdminBounce,
} from '../redux/slice/app.slice';
import { AppDispatch } from '../redux/store';
import GlobalUtils from './globalUtils';

const appVersionConfig = (dispatch: AppDispatch) => {
    // MARK: App version config
    const currentAppVersion = remoteConfig().getString(
        RemoteConfigKey.app_version,
    );
    console.log('Remote app_version', currentAppVersion);
    dispatch(setRemoteConfigAppVersion(currentAppVersion));
};

const forceUpdateConfig = (dispatch: AppDispatch) => {
    // MARK: Force update config
    const currentForceUpdate = remoteConfig().getBoolean(
        RemoteConfigKey.force_update,
    );
    console.log('Remote force_update', currentForceUpdate);
    dispatch(setForceUpdate(currentForceUpdate));
};

const transferConfig = (dispatch: AppDispatch) => {
    // MARK: Transfer config
    const minFeeForJettonTransfer = remoteConfig().getNumber(
        RemoteConfigKey.min_fee_for_jetton_transfer,
    );
    const tonAdminBounce = remoteConfig().getBoolean(
        RemoteConfigKey.ton_admin_bounce,
    );
    const jettonAdminBounce = remoteConfig().getBoolean(
        RemoteConfigKey.jetton_admin_bounce,
    );
    console.log('Remote min_fee_for_jetton_transfer', minFeeForJettonTransfer);
    console.log('Remote ton_admin_bounce', tonAdminBounce);
    console.log('Remote jetton_admin_bounce', jettonAdminBounce);
    dispatch(setMinFeeForJettonTransfer(minFeeForJettonTransfer));
    dispatch(setTonAdminBounce(tonAdminBounce));
    dispatch(setJettonAdminBounce(jettonAdminBounce));
};

const blockTransferConfig = (dispatch: AppDispatch) => {
    // MARK: Block transfer config
    const blockJettonTransfer = remoteConfig().getBoolean(
        RemoteConfigKey.block_jetton_transfer,
    );
    const blockTonNftTransfer = remoteConfig().getBoolean(
        RemoteConfigKey.block_ton_nft_transfer,
    );
    const blockTonTransfer = remoteConfig().getBoolean(
        RemoteConfigKey.block_ton_transfer,
    );
    const blockBitcoinTransfer = remoteConfig().getBoolean(
        RemoteConfigKey.block_bitcoin_transfer,
    );
    console.log('Remote block_jetton_transfer', blockJettonTransfer);
    console.log('Remote block_ton_nft_transfer', blockTonNftTransfer);
    console.log('Remote block_ton_transfer', blockTonTransfer);
    console.log('Remote block_bitcoin_transfer', blockBitcoinTransfer);
    dispatch(setBlockJettonTransfer(blockJettonTransfer));
    dispatch(setBlockTonNftTransfer(blockTonNftTransfer));
    dispatch(setBlockTonTransfer(blockTonTransfer));
    dispatch(setBlockBitcoinTransfer(blockBitcoinTransfer));
};

const themeConfig = () => {
    // MARK: Theme config
    const enableledgerifyNewTheme = remoteConfig().getBoolean(
        RemoteConfigKey.enable_ledgerify_new_theme,
    );
    const useRemoteThemeConfig = remoteConfig().getBoolean(
        RemoteConfigKey.use_remote_theme_config,
    );
    console.log('Remote enable_ledgerify_new_theme', enableledgerifyNewTheme);
    console.log('Remote use_remote_theme_config', useRemoteThemeConfig);
    GlobalUtils.setRemoteledgerifyNewTheme(enableledgerifyNewTheme);
    GlobalUtils.setUseRemoteThemeConfig(useRemoteThemeConfig);
};


const jailbreakConfig = () => {
    const skipCheckJailbreakOrRoot = remoteConfig().getBoolean(
        RemoteConfigKey.skip_check_jailbreak_or_root,
    );
    console.log(
        'Remote config skip_check_jailbreak_or_root: ',
        skipCheckJailbreakOrRoot,
    );

    return skipCheckJailbreakOrRoot;
};

const RemoteUtils = {
    appVersionConfig,
    forceUpdateConfig,
    transferConfig,
    blockTransferConfig,
    themeConfig,
    jailbreakConfig,
};

export default RemoteUtils;
