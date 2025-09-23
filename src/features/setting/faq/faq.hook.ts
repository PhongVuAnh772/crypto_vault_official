/* eslint-disable react-hooks/exhaustive-deps */
import { StackActions } from "@react-navigation/native";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import GlobalUtils from "src/core/utils/globalUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { getFAQState, getFAQThunk } from "./faq.slice";
import { FAQData } from "./faq.type";

const useFAQ = ({ navigation }: RootNavigationType) => {
  const dispatch = useAppDispatch();
  const { loading, faqData } = useAppSelector(getFAQState);
  const onPressItem = (item: FAQData) => {
    navigation.dispatch(StackActions.push(HomeStackScreenKey.FAQDetail, item));
  };
  useEffect(() => {
    if (!faqData) {
      dispatch(getFAQThunk());
    }
  }, []);

  return { loading, faqData, onPressItem };
};
export default useFAQ;
