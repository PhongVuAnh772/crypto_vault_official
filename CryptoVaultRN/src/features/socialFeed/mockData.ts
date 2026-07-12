import { FeedItemData } from './components/FeedItem';

export const mockFeedData: FeedItemData[] = [
  {
    id: 'post1',
    user: {
      id: 'u1',
      name: 'Nguyen Van A',
      avatar: 'https://i.pravatar.cc/150?u=u1'
    },
    type: 'text',
    content: 'Hôm nay thị trường crypto có vẻ xanh tươi quá mọi người ơi! Mình vừa chốt lời một ít Bitcoin.',
    createdAt: Date.now() - 3600000,
    likes: 120,
    comments: 15,
    views: 1050,
  },
  {
    id: 'post2',
    user: {
      id: 'u2',
      name: 'Crypto Master',
      avatar: 'https://i.pravatar.cc/150?u=u2'
    },
    type: 'image',
    content: 'Chart ETH đang rất đẹp, dự đoán có thể phá đỉnh cũ trong tuần này. Các bạn nghĩ sao?',
    images: ['https://images.unsplash.com/photo-1621504450181-5d356f61d307?auto=format&fit=crop&q=80&w=800'],
    createdAt: Date.now() - 7200000,
    likes: 342,
    comments: 56,
    views: 3200,
  },
  {
    id: 'post3',
    user: {
      id: 'u3',
      name: 'Trader Pro VN',
      avatar: 'https://i.pravatar.cc/150?u=u3'
    },
    type: 'live',
    content: 'Phân tích kỹ thuật thị trường cuối tuần',
    images: ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800'],
    createdAt: Date.now() - 10800000,
    likes: 560,
    comments: 120,
    views: 5600,
  }
];
