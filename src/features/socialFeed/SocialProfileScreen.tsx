import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FeedItem, { FeedItemData } from './components/FeedItem';

const MOCK_PROFILE = {
  name: 'Swapnil Ghosh',
  avatar: 'https://i.pravatar.cc/150?u=swapnil',
  followers: '1M',
  following: '100',
  bio: 'Former Email Marketing Specialist at GAOTEK 2024- 2025',
  education: 'S.S.C in Commerce, Narinda Govt. High. School Expected 2026',
  views: '655 content views 352 this month',
  joined: 'Joined July 2025'
};

const MOCK_POSTS: FeedItemData[] = [
  {
    id: 'post-1',
    user: {
      id: 'swapnil',
      name: 'Swapnil Ghosh',
      avatar: 'https://i.pravatar.cc/150?u=swapnil',
    },
    type: 'image',
    content: 'Become observant, notice surroundings, learn from examples, wisdom, mistakes, and everyday...',
    images: ['https://images.unsplash.com/photo-1513001900722-3705c136b99e?q=80&w=1000'],
    createdAt: Date.now() - 3600000,
    likes: 1250,
    comments: 85,
    views: 45000,
    isLiked: false,
  }
];

const SocialProfileScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const renderHeader = () => (
    <View style={styles.profileHeader}>
      {/* Top Banner Area / Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
           <Image source={{ uri: MOCK_PROFILE.avatar }} style={styles.mainAvatar} />
        </View>
        <View style={styles.nameSection}>
            <View style={styles.rowCenter}>
               <Text style={styles.profileName}>{MOCK_PROFILE.name}</Text>
               <MaterialCommunityIcons name="check-decagram" size={20} color="#3897f0" style={{ marginLeft: 6 }} />
            </View>
            <View style={styles.statsPillRow}>
                <View style={styles.statsPill}>
                    <Text style={styles.statsPillText}>{MOCK_PROFILE.followers} followers</Text>
                </View>
                <View style={styles.statsPill}>
                    <Text style={styles.statsPillText}>{MOCK_PROFILE.following} following</Text>
                </View>
            </View>
        </View>
      </View>

      {/* Primary Action Buttons */}
      <View style={styles.primaryActions}>
          <TouchableOpacity style={styles.actionCard}>
              <MaterialCommunityIcons name="account-plus-outline" size={24} color="#121212" />
              <Text style={styles.actionCardText}>Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#121212" />
              <Text style={styles.actionCardText}>Notify me</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
              <MaterialCommunityIcons name="help-circle-outline" size={24} color="#121212" />
              <Text style={styles.actionCardText}>Ask</Text>
          </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tabItem, styles.tabActive]}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#121212" />
              <Text style={styles.tabText}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
              <MaterialCommunityIcons name="image-outline" size={20} color="#848E9C" />
              <Text style={[styles.tabText, { color: '#848E9C' }]}>Photos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
              <MaterialCommunityIcons name="comment-question-outline" size={20} color="#848E9C" />
              <Text style={[styles.tabText, { color: '#848E9C' }]}>Questions</Text>
          </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.aboutCard}>
          <View style={styles.aboutItem}>
              <View style={styles.aboutIconBg}>
                  <MaterialCommunityIcons name="briefcase-outline" size={18} color="#121212" />
              </View>
              <Text style={styles.aboutText}>{MOCK_PROFILE.bio}</Text>
          </View>
          <View style={styles.aboutItem}>
              <View style={styles.aboutIconBg}>
                  <MaterialCommunityIcons name="school-outline" size={18} color="#121212" />
              </View>
              <Text style={styles.aboutText}>{MOCK_PROFILE.education}</Text>
          </View>
          <View style={styles.aboutItem}>
              <View style={styles.aboutIconBg}>
                  <MaterialCommunityIcons name="eye-outline" size={18} color="#121212" />
              </View>
              <Text style={styles.aboutText}>{MOCK_PROFILE.views}</Text>
          </View>
          <View style={styles.aboutItem}>
              <View style={styles.aboutIconBg}>
                  <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#121212" />
              </View>
              <Text style={styles.aboutText}>{MOCK_PROFILE.joined}</Text>
          </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingRight: 32 }}>
          <TouchableOpacity style={[styles.filterChip, styles.filterActive]}>
              <Text style={styles.filterActiveText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterText}>1 Answer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterText}>2 Questions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterText}>5 posts</Text>
          </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <LinearGradient
      colors={['#E0EAFC', '#CFDEF3', '#E0EAFC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Header */}
        <View style={styles.navHeader}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="chevron-left" size={28} color="#121212" />
            </TouchableOpacity>
            <View style={styles.navTitleRow}>
                <Text style={styles.navTitle}>{MOCK_PROFILE.name}</Text>
                <MaterialCommunityIcons name="check-decagram" size={16} color="#3897f0" style={{ marginLeft: 4 }} />
            </View>
            <TouchableOpacity style={styles.circleBtn}>
                <MaterialCommunityIcons name="dots-horizontal" size={24} color="#121212" />
            </TouchableOpacity>
        </View>

        <FlatList
          data={MOCK_POSTS}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <FeedItem item={item} />}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SocialProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  navTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#121212',
  },
  profileHeader: {
    paddingTop: 10,
  },
  avatarSection: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainAvatar: {
    width: '100%',
    height: '100%',
  },
  nameSection: {
    marginLeft: 16,
    flex: 1,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#121212',
  },
  statsPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statsPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  statsPillText: {
    fontSize: 12,
    color: '#848E9C',
    fontWeight: '500',
  },
  primaryActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#121212',
    marginTop: 4,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    marginRight: 24,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#121212',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#121212',
    marginLeft: 6,
  },
  aboutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aboutText: {
    flex: 1,
    fontSize: 14,
    color: '#121212',
    lineHeight: 20,
  },
  filterScroll: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  filterActive: {
    backgroundColor: '#CFDEF3',
    borderColor: '#3897f0',
  },
  filterActiveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#121212',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#848E9C',
  },
});
