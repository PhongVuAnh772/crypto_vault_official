import * as LocalAuthentication from "expo-local-authentication";
import { TFunction } from "i18next";
import * as Keychain from "react-native-keychain";
import { check, PERMISSIONS, RESULTS } from "react-native-permissions";
import { Dispatch } from "redux";
import Utils from "src/utils/commonUtils";
import {
  FaceIdOrTouchCheckType,
  ResultErrorType,
} from "../enum/faceIdOrTouchType";
import {
  setEnableFaceIdOrTouch,
  setLockoutLocalAuthentication,
} from "../redux/slices/auth.slice";
class FaceIdOrTouch {
  translation: TFunction<"translation", undefined>;
  requestString: string | undefined;
  typeBiometrixString: string | undefined;
  dispatch!: Dispatch;
  isLockoutLocalAuthentication: boolean;

  constructor(
    translation: TFunction<"translation", undefined>,
    dispatch: Dispatch,
    isLockoutLocalAuthentication: boolean
  ) {
    this.translation = translation;
    this.typeBiometrixString = Utils.isAndroid
      ? translation(LanguageKey.common_text_touch_id)
      : translation(LanguageKey.common_text_face_id_and_touch);
    this.requestString = translation(LanguageKey.face_id_request_description, {
      type: Utils.isAndroid
        ? translation(LanguageKey.common_text_touch_id)
        : translation(LanguageKey.common_text_face_id_and_touch),
    });
    this.dispatch = dispatch;
    this.isLockoutLocalAuthentication = isLockoutLocalAuthentication;
  }

  async reset() {
    await Keychain.resetGenericPassword();
  }

  checkFaceIdOrTouch = async (): Promise<FaceIdOrTouchCheckType> => {
    const isSimulator = await Utils.checkingEmulator();
    if (isSimulator) {
      console.log("Simulator running FaceID.");
      return FaceIdOrTouchCheckType.Done;
    }

    const checkPermissionResult = await this._checkFaceIdPermission();

    switch (checkPermissionResult) {
      case FaceIdOrTouchCheckType.Reject:
      case FaceIdOrTouchCheckType.OpenSettings:
        this.dispatch(setEnableFaceIdOrTouch(false));
        return checkPermissionResult;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      this.dispatch(setEnableFaceIdOrTouch(false));

      Utils.showToast({
        msg: this.translation(LanguageKey.face_id_not_support, {
          type: Utils.isAndroid
            ? this.translation(LanguageKey.common_text_touch_id)
            : this.translation(LanguageKey.common_text_face_id_and_touch),
        }),
        type: AppToastType.error,
      });
      return FaceIdOrTouchCheckType.Reject;
    }

    // const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    // console.log(isEnrolled, 'isEnrolled');
    // if (!isEnrolled) {
    //     Utils.showToast({
    //         msg: this.translation(LanguageKey.face_id_no_biometric),
    //         type: AppToastType.error,
    //     });
    //     return FaceIdOrTouchCheckType.Reject;
    // }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: this.requestString,
      cancelLabel: this.translation(LanguageKey.common_text_cancel),
    });
    if (result.success) {
      return FaceIdOrTouchCheckType.Done;
    }

    if (result.error === ResultErrorType.Lockout) {
      this.dispatch(setEnableFaceIdOrTouch(false));
      this.dispatch(setLockoutLocalAuthentication(true));
      return FaceIdOrTouchCheckType.Reject;
    }

    Utils.showToast({
      msg: this.translation(LanguageKey.face_id_error),
      type: AppToastType.error,
    });
    this.dispatch(setEnableFaceIdOrTouch(false));

    return FaceIdOrTouchCheckType.Reject;
  };

  async storePinCode(pinCode: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword("pin", pinCode, {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
        accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
        authenticationPrompt: {
          title: this.translation(LanguageKey.face_id_request_title, {
            type: this.typeBiometrixString,
          }),
          description: this.requestString,
        },
      });
      return true;
    } catch (error) {
      this.dispatch(setEnableFaceIdOrTouch(false));
      console.error("Error storing PIN code: ", error);
      return false;
    }
  }

  async getPinCode(): Promise<string | undefined> {
    try {
      const credentials = await Keychain.getGenericPassword({
        authenticationPrompt: {
          title: this.translation(LanguageKey.face_id_request_title, {
            type: this.typeBiometrixString,
          }),
          description: this.requestString,
        },
      });
      if (credentials) {
        console.log("Retrieved PIN code Done");
        return credentials.password;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error("Error retrieving PIN code: ", error);
      return undefined;
    }
  }

  _checkFaceIdPermission = async (): Promise<FaceIdOrTouchCheckType> => {
    const permission = PERMISSIONS.IOS.FACE_ID;

    return await check(permission)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log(
              "This feature is not available (on this device / in this context)"
            );
            this.dispatch(setEnableFaceIdOrTouch(false));
            return FaceIdOrTouchCheckType.Done;
          case RESULTS.DENIED:
            console.log(
              "The permission has not been requested / is denied but requestable"
            );
            this.dispatch(setEnableFaceIdOrTouch(false));
            return FaceIdOrTouchCheckType.Done;
          case RESULTS.LIMITED:
            console.log("The permission is limited: some actions are possible");
            this.dispatch(setEnableFaceIdOrTouch(false));
            return FaceIdOrTouchCheckType.Reject;
          case RESULTS.GRANTED:
            console.log("GRANTED");
            return FaceIdOrTouchCheckType.Done;
          case RESULTS.BLOCKED:
            console.log("The permission is denied and not requestable anymore");
            this.dispatch(setEnableFaceIdOrTouch(false));
            return FaceIdOrTouchCheckType.OpenSettings;
          default:
            this.dispatch(setEnableFaceIdOrTouch(false));
            return FaceIdOrTouchCheckType.Reject;
        }
      })
      .catch((error) => {
        this.dispatch(setEnableFaceIdOrTouch(false));
        console.log("checkCameraPermission error", error);
        return FaceIdOrTouchCheckType.Reject;
      });
  };
}

export default FaceIdOrTouch;
