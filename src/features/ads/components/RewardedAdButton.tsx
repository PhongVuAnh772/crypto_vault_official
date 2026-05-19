import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import AdMobService from 'src/features/admob/AdMobService';
import { Feather } from '@expo/vector-icons';
import Utils from 'src/core/utils/commonUtils';
import AppToastType from 'src/core/enum/AppToastType';

type Props = {
  onAdFinished: () => void;
  hasBenefit?: boolean;
};

const RewardedAdButton: React.FC<Props> = ({ onAdFinished, hasBenefit }) => {
  const theme = useAppTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleWatchAd = async () => {
    setIsLoading(true);
    try {
      const finished = await AdMobService.showRewarded();
      if (finished) {
        onAdFinished();
        Utils.showToast({
          msg: 'Reward unlocked. Better swap price is active.',
          type: AppToastType.success,
        });
      } else {
        Utils.showToast({
          msg: 'Ad is not ready yet. Please try again in a moment.',
          type: AppToastType.info,
        });
      }
    } catch (err) {
      console.log('Error showing ad:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (hasBenefit) {
    return (
      <View style={[styles.container, styles.activeContainer, { borderColor: theme.colors.success_outline }]}>
        <Feather name="check-circle" size={16} color={theme.colors.success_text} />
        <AppText 
          title=" Better price reward is active" 
          variant={TextVariantKeys.bodyBSmall} 
          textColor={theme.colors.success_text} 
        />
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.surface_surface_brand }]} 
      onPress={handleWatchAd}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Feather name="gift" size={18} color="#fff" />
          <AppText 
            title=" Watch ad to unlock better swap rate" 
            variant={TextVariantKeys.bodyBSmall} 
            textColor="#fff" 
          />
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  activeContainer: {
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    borderWidth: 1,
    borderStyle: 'solid',
  }
});

export default RewardedAdButton;
