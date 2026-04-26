import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeedItem from './components/FeedItem';
import { BASE_URL } from '../../../env.config';



const PostDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { post } = route.params;
  const [commentText, setCommentText] = useState('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`${BASE_URL}feed/${post.id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(Array.isArray(data) ? data : []);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.log('Error fetching comments:', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [post.id]);

  const handleLikeComment = (id: string) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      content: commentText,
      user: {
        id: 'usr-master',
        name: 'You',
        avatar: 'https://i.pravatar.cc/150'
      },
      time: 'Vừa xong'
    };

    // Optimistic update
    setComments(prev => [newComment, ...prev]);
    setCommentText('');

    try {
      const response = await fetch(`${BASE_URL}feed/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentText,
          user_id: 'usr-master',
          user_name: 'You'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      // Revert optimistic update if needed or show error
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
            <MaterialCommunityIcons name="chevron-left" size={32} color="#121212" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bài viết của {post.user.name}</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <FeedItem item={post} isDetail={true} />
          
          <View style={styles.commentsSection}>
            <View style={styles.commentFilter}>
              <Text style={styles.filterText}>Phù hợp nhất</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#121212" />
            </View>

            {loading ? (
              <ActivityIndicator style={{ marginTop: 20 }} color="#FCD535" />
            ) : (
              comments.map(comment => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image source={{ uri: comment.user?.avatar || 'https://i.pravatar.cc/150' }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <View style={styles.commentBubble}>
                      <View style={styles.commentNameRow}>
                        <Text style={styles.commentName}>{comment.user?.name || 'User'}</Text>
                        {comment.user?.isAuthor && (
                          <View style={styles.authorBadge}>
                            <MaterialCommunityIcons name="pencil" size={10} color="#65676B" />
                            <Text style={styles.authorText}>Tác giả</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.commentText}>{comment.content || comment.text}</Text>
                    </View>
                    <View style={styles.commentActions}>
                      <Text style={styles.commentActionText}>{comment.time || 'Vừa xong'}</Text>
                      <TouchableOpacity onPress={() => handleLikeComment(comment.id)}>
                        <Text style={[styles.commentActionText, likedComments.has(comment.id) && { color: '#3897f0' }]}>Thích</Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text style={styles.commentActionText}>Phản hồi</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomInputContainer}>
          <TouchableOpacity style={styles.cameraBtn}>
            <MaterialCommunityIcons name="camera-outline" size={24} color="#65676B" />
          </TouchableOpacity>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="Viết bình luận..."
              placeholderTextColor="#848E9C"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <MaterialCommunityIcons name="star-four-points-outline" size={20} color="#65676B" style={styles.inputIcon} />
            <MaterialCommunityIcons name="file-gif-box" size={24} color="#65676B" style={styles.inputIcon} />
            <MaterialCommunityIcons name="emoticon-happy-outline" size={20} color="#65676B" style={styles.inputIcon} />
          </View>
          {commentText.trim().length > 0 && (
             <TouchableOpacity style={styles.sendBtn} onPress={handleSendComment}>
               <MaterialCommunityIcons name="send" size={20} color="#3897f0" />
             </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerLeft: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#121212' },
  content: { flex: 1 },
  commentsSection: { paddingHorizontal: 16, paddingBottom: 20 },
  commentFilter: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  filterText: { fontSize: 14, fontWeight: 'bold', color: '#121212', marginRight: 4 },
  commentItem: { flexDirection: 'row', marginBottom: 16 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8, backgroundColor: '#F2F2F7' },
  commentContent: { flex: 1 },
  commentBubble: { backgroundColor: '#F2F2F7', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' },
  commentNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  commentName: { fontSize: 13, fontWeight: 'bold', color: '#121212', marginRight: 6 },
  authorBadge: { flexDirection: 'row', alignItems: 'center' },
  authorText: { fontSize: 11, color: '#65676B', marginLeft: 2 },
  commentText: { fontSize: 14, color: '#121212' },
  commentActions: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 12 },
  commentActionText: { fontSize: 12, color: '#65676B', fontWeight: 'bold', marginRight: 16 },
  bottomInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    backgroundColor: '#FFFFFF',
  },
  cameraBtn: { padding: 8, marginRight: 4, marginBottom: 2 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    minHeight: 40,
    paddingVertical: 6,
  },
  textInput: { flex: 1, fontSize: 14, color: '#121212', maxHeight: 100, paddingTop: 4 },
  inputIcon: { marginLeft: 10 },
  sendBtn: { padding: 8, marginLeft: 4, marginBottom: 2 },
});
