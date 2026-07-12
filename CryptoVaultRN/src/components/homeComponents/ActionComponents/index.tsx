import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import AppSkeletonLoading from 'src/components/common/AppSkeletonLoading';
import {
    LinkSvgIcon,
    ReceiveSvgIcon,
    SendSvgIcon
} from 'src/core/constants/AppIconsSvg';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import HomeButtonWithTitle from '../HomeButtonWithTitle';
import useStyles from './styles';

type ActionComponentType = {
  sendAction: () => void;
  receiveAction: () => void;
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;

  isHome?: boolean;
  moreAction?: () => void;
};

const ActionComponent: React.FC<ActionComponentType> = ({
  sendAction,
  receiveAction,
  style,
  isLoading,

  moreAction,
  isHome = false,
}) => {
  const theme = useAppTheme();
  const styles = useStyles(theme);

  return isLoading ? (
    <View style={[styles.actionContainer, style]}>
      <View
        style={[
          appStyles.flex1,
          appStyles.justifyContentCenter,
          appStyles.alignItemsCenter,
        ]}
      >
        <AppSkeletonLoading width={36} height={36} />
        <View style={appStyles.mt5}>
          <AppSkeletonLoading width={25} height={16} />
        </View>
      </View>
      <View style={styles.line} />
      <View
        style={[
          appStyles.flex1,
          appStyles.justifyContentCenter,
          appStyles.alignItemsCenter,
        ]}
      >
        <AppSkeletonLoading width={36} height={36} />
        <View style={appStyles.mt5}>
          <AppSkeletonLoading width={25} height={16} />
        </View>
      </View>
    </View>
  ) : (
    <View style={[styles.actionContainer, style]}>
      <View style={[appStyles.flex1]}>
        <HomeButtonWithTitle
          icon={<SendSvgIcon color={styles.colorIcon.color} />}
          onPress={sendAction}
          titleWithI18n={"Deposit"}
        />
      </View>
      <View style={[appStyles.flex1]}>
        <HomeButtonWithTitle
          icon={<ReceiveSvgIcon color={styles.colorIcon.color} />}
          onPress={receiveAction}
          titleWithI18n={LanguageKey.home_receive_title}
        />
      </View>


      {isHome && moreAction && (
        <View style={[appStyles.flex1]}>
          <HomeButtonWithTitle
            icon={<LinkSvgIcon color={styles.colorIcon.color} />}
            onPress={moreAction}
            titleWithI18n={"More"}
          />
        </View>
      )}
    </View>
  );
};

export default ActionComponent;
