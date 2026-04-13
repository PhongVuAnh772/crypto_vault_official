import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import appStyles from 'src/core/styles';

const TASKS = [
  { id: 1, title: 'Complete Survey', reward: '1.5 USDT', icon: 'file-text' },
  { id: 2, title: 'Install Games', reward: '5.0 USDT', icon: 'play' },
  { id: 3, title: 'Follow Socials', reward: '0.2 USDT', icon: 'share-2' },
];

const OfferwallScreen: React.FC = () => {
  const theme = useAppTheme();

  return (
    <ScreenWrapper headerTitle="Earn Rewards" enableHeader>
      <ScrollView contentContainerStyle={appStyles.pH20}>
        <View style={styles.banner}>
          <AppText title="Complete tasks to earn up to 10 USDT" variant={TextVariantKeys.titleLarge} />
        </View>

        {TASKS.map(task => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskItem, { backgroundColor: theme.colors.surface_surface_brand }]}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.colors.inversePrimary }]}>
              <Feather name={task.icon as any} size={20} color="#fff" />
            </View>
            <View style={styles.taskInfo}>
              <AppText title={task.title} variant={TextVariantKeys.titleSmall} />
              <AppText title="Reward: 1 hour active" variant={TextVariantKeys.bodyRSmall} textColor={theme.colors.inversePrimary} />
            </View>
            <View style={styles.rewardBadge}>
              <AppText title={task.reward} variant={TextVariantKeys.bodyRSmall} textColor={theme.colors.inversePrimary} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  banner: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFD700',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 16,
  },
  rewardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  }
});

export default OfferwallScreen;
