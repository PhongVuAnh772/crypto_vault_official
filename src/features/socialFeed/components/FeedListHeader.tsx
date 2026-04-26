import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FeedListHeaderProps {
  onPost: () => void;
  onLiveBroadcast: () => void;
}

const FeedListHeader: React.FC<FeedListHeaderProps> = ({ onPost, onLiveBroadcast }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.searchBar} onPress={onPost}>
        <MaterialCommunityIcons name="star-four-points" size={20} color="#3897f0" />
        <Text style={styles.searchText}>What do you want to ask or share?</Text>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.headerActionBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color="#121212" />
          <Text style={styles.headerActionText}>Answer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerActionBtn} onPress={onLiveBroadcast}>
          <MaterialCommunityIcons name="video-outline" size={20} color="#ff4d4d" />
          <Text style={styles.headerActionText}>Live</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerActionBtn} onPress={onPost}>
          <MaterialCommunityIcons name="fountain-pen-tip" size={20} color="#121212" />
          <Text style={styles.headerActionText}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity style={[styles.tabItem, styles.tabActive]}>
            <Text style={[styles.tabText, styles.tabTextActive]}>Khám phá</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabText}>Live</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabText}>Đang theo dõi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabText}>Chiến dịch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabText}>Answer</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

export default memo(FeedListHeader);

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    margin: 16,
    padding: 16,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 54,
    borderRadius: 27,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchText: {
    color: '#848E9C',
    fontSize: 15,
    marginLeft: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerActionText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  tabsContainer: {
    marginTop: 20,
    marginHorizontal: -16,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  tabActive: {
    backgroundColor: '#3897f0',
  },
  tabText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
});
