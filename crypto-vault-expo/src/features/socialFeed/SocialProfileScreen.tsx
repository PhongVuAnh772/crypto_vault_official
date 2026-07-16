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
import { BASE_URL } from '../../../env.config';
import FeedItem, { FeedItemData } from './components/FeedItem';

// Removed mock data as we will use real API data

const SocialProfileScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId = 'usr-master' } = route.params || {};

  const [profile, setProfile] = React.useState<any>(null);
  const [posts, setPosts] = React.useState<FeedItemData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      // 1. Fetch Profile
      const profileRes = await fetch(`${BASE_URL}feed/profile/${userId}`);
      const profileData = await profileRes.json();
      setProfile(profileData);

      // 2. Fetch User Posts
      const postsRes = await fetch(`${BASE_URL}feed?user_id=${userId}&limit=20`);
      const postsData = await postsRes.json();
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderHeader = () => {
    if (!profile) return null;

    return (
      <View style={styles.profileHeader}>
        {/* Top Banner Area / Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
             <Image source={{ uri: profile.avatar }} style={styles.mainAvatar} />
          </View>
          <View style={styles.nameSection}>
              <View style={styles.rowCenter}>
                 <Text style={styles.profileName}>{profile.name}</Text>
                 {profile.isVerified && (
                   <MaterialCommunityIcons name="check-decagram" size={20} color="#3897f0" style={{ marginLeft: 6 }} />
                 )}
              </View>
              <View style={styles.statsPillRow}>
                  <View style={styles.statsPill}>
                      <Text style={styles.statsPillText}>{profile.followers} followers</Text>
                  </View>
                  <View style={styles.statsPill}>
                      <Text style={styles.statsPillText}>{profile.following} following</Text>
                  </View>
              </View>
          </View>
        </View>

        {/* Primary Action Buttons */}
        <View style={styles.primaryActions}>
            <TouchableOpacity style={styles.actionCard}>
                <MaterialCommunityIcons name="account-plus" size={26} color="#121212" />
                <Text style={styles.actionCardText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
                <MaterialCommunityIcons name="bell-outline" size={26} color="#121212" />
                <Text style={styles.actionCardText}>Notify me</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
                <MaterialCommunityIcons name="help-circle-outline" size={26} color="#121212" />
                <Text style={styles.actionCardText}>Ask</Text>
            </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tabItem, styles.tabActive]}>
                <Text style={styles.tabText}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
                <Text style={[styles.tabText, { color: '#848E9C' }]}>Photos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
                <Text style={[styles.tabText, { color: '#848E9C' }]}>Questions</Text>
            </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.aboutCard}>
            <View style={styles.aboutItem}>
                <View style={styles.aboutIconBg}>
                    <MaterialCommunityIcons name="briefcase" size={18} color="#121212" />
                </View>
                <Text style={styles.aboutText}>{profile.bio}</Text>
            </View>
            <View style={styles.aboutItem}>
                <View style={styles.aboutIconBg}>
                    <MaterialCommunityIcons name="school" size={18} color="#121212" />
                </View>
                <Text style={styles.aboutText}>{profile.education}</Text>
            </View>
            <View style={styles.aboutItem}>
                <View style={styles.aboutIconBg}>
                    <MaterialCommunityIcons name="eye" size={18} color="#121212" />
                </View>
                <Text style={styles.aboutText}>{profile.views}</Text>
            </View>
            <View style={styles.aboutItem}>
                <View style={styles.aboutIconBg}>
                    <MaterialCommunityIcons name="calendar" size={18} color="#121212" />
                </View>
                <Text style={styles.aboutText}>{profile.joined}</Text>
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
                <Text style={styles.filterText}>{profile.postCount || 0} posts</Text>
            </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#DBE9F9', '#DBE9F9']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Header */}
        <View style={styles.navHeader}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="chevron-left" size={28} color="#121212" />
            </TouchableOpacity>
            <View style={styles.navTitleRow}>
                <Text style={styles.navTitle}>{profile?.name || 'Loading...'}</Text>
                {profile?.isVerified && (
                  <MaterialCommunityIcons name="check-decagram" size={16} color="#3897f0" style={{ marginLeft: 4 }} />
                )}
            </View>
            <TouchableOpacity style={styles.circleBtn}>
                <MaterialCommunityIcons name="dots-horizontal" size={24} color="#121212" />
            </TouchableOpacity>
        </View>

        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <FeedItem item={item} />}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshing={refreshing}
          onRefresh={onRefresh}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFD',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
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
    marginBottom: 25,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
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
    backgroundColor: '#F0F5FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsPillText: {
    fontSize: 13,
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
    height: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  actionCardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#121212',
    marginTop: 8,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginRight: 32,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#121212',
  },
  tabText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#121212',
  },
  aboutCard: {
    backgroundColor: '#F0F5FA',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  aboutIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  aboutText: {
    flex: 1,
    fontSize: 15,
    color: '#121212',
    lineHeight: 22,
    fontWeight: '500',
  },
  filterScroll: {
    paddingLeft: 16,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  filterActive: {
    backgroundColor: '#D1E3F8',
    borderWidth: 1.5,
    borderColor: '#3897f0',
  },
  filterActiveText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#121212',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#848E9C',
  },
});
