import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppText from 'src/components/common/AppText';
import AppToastType from 'src/core/enum/AppToastType';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { sendPost } from 'src/core/network/requests';
import { useAppSelector } from 'src/core/redux/hooks';
import { getAccountId } from 'src/core/redux/slice/account.slice';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';

const TASKS = [
  { id: 'survey', title: 'Complete Survey', reward: 1.5, icon: 'file-text', desc: 'Answer and complete partner surveys' },
  { id: 'install', title: 'Install Games', reward: 5.0, icon: 'play', desc: 'Install and open featured game offers' },
  { id: 'social', title: 'Follow Socials', reward: 0.2, icon: 'share-2', desc: 'Follow official channels and communities' },
];

const OfferwallScreen: React.FC = () => {
  const theme = useAppTheme();
  const userId = useAppSelector(getAccountId);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedTaskIds, setClaimedTaskIds] = useState<Record<string, boolean>>({});

  const totalReward = useMemo(
    () => TASKS.reduce((acc, task) => acc + task.reward, 0),
    [],
  );

  const claimTask = async (taskId: string, rewardValue: number) => {
    if (!userId) {
      Utils.showToast({ msg: 'Wallet account is required', type: AppToastType.error });
      return;
    }
    if (claimedTaskIds[taskId]) {
      Utils.showToast({ msg: 'Task already claimed', type: AppToastType.info });
      return;
    }

    setClaimingId(taskId);
    try {
      const externalId = `${userId}-${taskId}-${Date.now()}`;
      const res = await sendPost<{ success: boolean; message?: string }>({
        endPoint: 'ads/reward/callback',
        body: {
          userId,
          type: 'OFFERWALL',
          rewardValue,
          externalId,
          taskId,
        },
      });

      if (res.isSuccess) {
        setClaimedTaskIds((prev) => ({ ...prev, [taskId]: true }));
        Utils.showToast({ msg: `Claimed ${rewardValue} USDT reward`, type: AppToastType.success });
      } else {
        Utils.showToast({ msg: 'Failed to claim reward', type: AppToastType.error });
      }
    } catch (error) {
      Utils.showToast({ msg: 'Failed to claim reward', type: AppToastType.error });
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScreenWrapper headerTitle="Earn Rewards" enableHeader>
      <ScrollView contentContainerStyle={appStyles.pH20}>
        <View style={styles.banner}>
          <AppText title="Earn More Rewards" variant={TextVariantKeys.titleLarge} textColor="#111827" />
          <AppText title={`Complete tasks and claim up to ${totalReward.toFixed(1)} USDT`} variant={TextVariantKeys.bodyMSmall} textColor="#334155" />
        </View>

        {TASKS.map(task => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskItem, { backgroundColor: theme.colors.surface_surface_brand }]}
            onPress={() => claimTask(task.id, task.reward)}
            disabled={claimingId === task.id}
            activeOpacity={0.85}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.colors.inversePrimary }]}>
              <Feather name={task.icon as any} size={20} color="#fff" />
            </View>
            <View style={styles.taskInfo}>
              <AppText title={task.title} variant={TextVariantKeys.titleSmall} textColor="#FFFFFF" />
              <AppText title={task.desc} variant={TextVariantKeys.bodyRSmall} textColor="rgba(255,255,255,0.75)" />
            </View>
            <View style={[styles.rewardBadge, claimedTaskIds[task.id] && styles.claimedBadge]}>
              {claimingId === task.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <AppText
                  title={claimedTaskIds[task.id] ? 'Claimed' : `${task.reward} USDT`}
                  variant={TextVariantKeys.bodyRSmall}
                  textColor="#FFFFFF"
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  banner: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FACC15',
    gap: 6,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 16,
  },
  rewardBadge: {
    minWidth: 90,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(17,24,39,0.22)',
    alignItems: 'center',
  },
  claimedBadge: {
    backgroundColor: 'rgba(22,163,74,0.78)',
  },
});

export default OfferwallScreen;
