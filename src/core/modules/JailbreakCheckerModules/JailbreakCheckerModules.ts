import { NativeModules } from 'react-native';
import Utils from 'src/core/utils/commonUtils';
class NativeJailbreakCheckerModule {
    private readonly _jailbreakCheckerModule;

    constructor() {
        this._jailbreakCheckerModule = NativeModules.JailbreakCheckerModule;
    }

    public async isJailBroken(): Promise<boolean | undefined> {
        const isSimulator = await Utils.checkingEmulator();
        return await new Promise<boolean>((resolve, reject) => {
            try {
                this._jailbreakCheckerModule.isJailBroken(
                    isSimulator,
                    () => {
                        resolve(true);
                    },
                    (error: any) => {
                        // console.log('isJailBroken error', error);
                        reject(new Error(error));
                    },
                );
            } catch (error_1) {
                console.log('isJailBroken catch error', error_1);
                return undefined;
            }
        });
    }
}
export default NativeJailbreakCheckerModule;
