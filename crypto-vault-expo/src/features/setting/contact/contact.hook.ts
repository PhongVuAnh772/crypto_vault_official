import { StackActions } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  getStateActionFailedNeedToContact,
  setActionFailedNeedToContact,
} from "src/core/redux/slice/app.slice";
import Utils from "src/core/utils/commonUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { getContactSupportState, sendContact } from "./contact.slice";
import { ContactParams } from "./contact.type";
const useContact = ({ navigation }: RootNavigationType) => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [inquiry, setInquiry] = useState<string>("");
  const { loading } = useAppSelector(getContactSupportState);
  const dispatch = useAppDispatch();
  const contactActionFailed = useAppSelector(getStateActionFailedNeedToContact);
  const backAction = () => {
    navigation.goBack();
    dispatch(setActionFailedNeedToContact(""));
  };

  const postContactSupport = async (params: ContactParams) => {
    dispatch(sendContact(params)).then((data) => {
      if (data.payload) {
        navigation.dispatch(
          StackActions.replace(HomeStackScreenKey.ContactSuccess)
        );
      }
    });
  };

  const validate = () => {
    if (
      email.trim().length &&
      name.trim().length &&
      inquiry.trim().length &&
      Utils.emailValid(email.trim())
    ) {
      return true;
    }
    return false;
  };
  const onSubmit = () => {
    if (validate()) {
      postContactSupport({
        email,
        inquiry,
        name,
        context: contactActionFailed,
      });
    }
  };
  return {
    t,
    name,
    email,
    inquiry,
    setName,
    setEmail,
    setInquiry,
    loading,
    validate,
    onSubmit,
    backAction,
  };
};
export default useContact;
